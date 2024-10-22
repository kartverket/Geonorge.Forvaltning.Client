import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRevalidator } from 'react-router-dom';
import { useMap } from 'context/MapProvider';
import { useModal } from 'context/ModalProvider';
import { selectFeature, toggleEditMode } from 'store/slices/mapSlice';
import { createDataObject, deleteDataObjects, updateDataObject } from 'store/slices/objectSlice';
import { getFeatureById, getLayer, getProperties, getPropertyValue, zoomToFeature } from 'utils/helpers/map';
import { addFeatureToMap, createFeature, highlightFeature, removeFeatureFromMap, setNextAndPreviousFeatureId, toggleFeature } from 'context/MapProvider/helpers/feature';
import { useAddDatasetObjectMutation, useDeleteDatasetObjectsMutation, useUpdateDatasetObjectMutation } from 'store/services/api';
import { deleteFeatures } from 'utils/helpers/general';
import { updateFeature } from './helpers';
import { modalType } from 'components/Modals';
import { useDataset } from 'context/DatasetProvider';
import { isNil } from 'lodash';
import FeatureForm from './FeatureForm';
import Feature from './Feature';
import styles from './FeatureInfo.module.scss';

function FeatureInfo() {
   const { definition, metadata, analysableDatasetIds } = useDataset();
   const { map, setAnalysisResult } = useMap();
   const { showModal } = useModal();
   const [expanded, setExpanded] = useState(false);
   const [feature, setFeature] = useState(null);
   const [featureToEdit, setFeatureToEdit] = useState(null);
   const [add] = useAddDatasetObjectMutation();
   const [update] = useUpdateDatasetObjectMutation();
   const [_delete] = useDeleteDatasetObjectsMutation();
   const revalidator = useRevalidator();
   const selectedFeature = useSelector(state => state.map.selectedFeature);
   const createdDataObject = useSelector(state => state.object.createdDataObject);
   const updatedDataObject = useSelector(state => state.object.updatedDataObject);
   const deletedDataObjects = useSelector(state => state.object.deletedDataObjects);
   const user = useSelector(state => state.app.user);
   const dispatch = useDispatch();

   const startEditMode = useCallback(
      feature => {
         const clone = feature.clone();
         const vectorLayer = getLayer(map, 'features-edit');
         const vectorSource = vectorLayer.getSource();
         
         vectorSource.addFeature(clone);         
         setFeatureToEdit({ original: feature, clone });
         toggleFeature(feature);
         dispatch(toggleEditMode(true));
      },
      [map, dispatch]
   );

   function exitEditMode() {
      const vectorLayer = getLayer(map, 'features-edit');
      const vectorSource = vectorLayer.getSource();

      vectorSource.clear();      
      toggleFeature(featureToEdit.original);
      setFeatureToEdit(null);
      dispatch(toggleEditMode(false));
   }

   useEffect(
      () => {
         if (map !== null && selectedFeature !== null) {
            const _feature = getFeatureById(map, selectedFeature.id, selectedFeature.featureType);

            setFeature(_feature);
            setExpanded(true);
         } else {
            setFeature(null);
            setExpanded(false);
         }
      },
      [selectedFeature, map]
   );

   useEffect(
      () => {
         if (map !== null && createdDataObject !== null) {
            const feature = createFeature(createdDataObject.geoJson);
            feature.set('_geomType', createdDataObject.type);

            addFeatureToMap(map, feature);
            highlightFeature(map, feature);
            startEditMode(feature);
            setExpanded(true);
         }
      },
      [createdDataObject, map, startEditMode]
   );

   useEffect(
      () => {
         if (map !== null && updatedDataObject !== null) {
            const updated = updateFeature(updatedDataObject, map);

            if (updated !== null && feature !== null && updatedDataObject.id === getPropertyValue(feature, 'id')) {
               setFeature(updated);
            }
         }
      },
      [updatedDataObject, map, feature]
   );

   useEffect(
      () => {
         if (map === null || !deletedDataObjects.length) {
            return;
         }

         deleteFeatures(deletedDataObjects, map);

         if (selectedFeature !== null && deletedDataObjects.includes(selectedFeature.id)) {
            dispatch(deleteDataObjects([]));
            dispatch(selectFeature(null));
         }
      },
      [deletedDataObjects, selectedFeature, map, dispatch]
   );

   async function addObject(payload) {      
      try {
         const response = await add({
            payload,
            table: definition.TableName,
            tableId: definition.Id,
            ownerOrg: definition.Organization,
            definition: definition
         }).unwrap();

         revalidator.revalidate();                 
         
         const properties = getProperties(featureToEdit.clone.getProperties());
         featureToEdit.original.setProperties(properties, true);
         featureToEdit.original.setGeometry(featureToEdit.clone.getGeometry());        
         featureToEdit.original.set('id', { name: 'ID', value: response.id });

         setFeature(featureToEdit.original);
         setNextAndPreviousFeatureId(map, featureToEdit.original);
         exitEditMode();

         dispatch(createDataObject(null));
         dispatch(selectFeature({ id: response.id, zoom: true }));
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'Kunne ikke legge til nytt objekt.'
         });
      }
   }

   async function updateObject(id, payload) {
      try {
         await update({
            id,
            payload,
            table: definition.TableName,
            tableId: definition.Id,
            ownerOrg: definition.Organization,
            definition: definition
         }).unwrap();

         revalidator.revalidate();

         exitEditMode();
         dispatch(updateDataObject({ id, properties: payload }));
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'Kunne ikke oppdatere objekt.'
         });
      }
   }

   async function deleteObject(id) {
      const { result } = await showModal({
         type: modalType.CONFIRM,
         title: 'Slett objekt',
         body: 'Er du sikker på at du vil slette objektet?',
         okText: 'Slett'
      });

      if (!result) {
         return;
      }

      try {
         await _delete({
            ids: [id],
            table: definition.TableName,
            tableId: definition.Id
         }).unwrap();

         revalidator.revalidate();

         removeFeatureFromMap(map, featureToEdit.original, 'features');
         exitEditMode();

         dispatch(deleteDataObjects([id]));
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'Kunne ikke slette objekt.'
         });
      }
   }

   function canEdit() {
      return user !== null && (definition.Viewers === null || !definition.Viewers.includes(user.organization) || hasPropertyAccess(feature, definition));
   }

   function hasPropertyAccess(feature, definition) 
   {
      var accessGranted = false;
      definition.ForvaltningsObjektPropertiesMetadata.forEach((property) => {
         var inputName = feature.get([property.ColumnName]).name;
         var inputValue = feature.get([property.ColumnName]).value;
         property.AccessByProperties.forEach((access) => {
            if (property.Name == inputName && access.Value === inputValue) {
               accessGranted = true;
               return accessGranted;
            }         
         });
      });
      
      return accessGranted;
   }

   function edit() {
      startEditMode(feature);
   }

   async function save(payload) {
      const featureId = featureToEdit.clone.get('id').value;

      if (payload === null) {
         exitEditMode();
      } else if (featureId === null) {
         await addObject(payload);
      } else {
         await updateObject(featureId, payload);
      }
   }

   function cancel() {      
      const isNewObject = featureToEdit.clone.get('id').value === null;

      if (isNewObject) {
         dispatch(createDataObject(null));
         removeFeatureFromMap(map, featureToEdit.original);
      }

      exitEditMode();
   }

   function toggleExpanded() {
      setExpanded(!expanded);
   }

   function zoomToObject() {
      zoomToFeature(map, feature, 15);
   }

   async function analyze() {
      const { data } = await showModal({
         type: modalType.ANALYSIS,
         datasetId: definition.Id,
         objectId: feature.get('id').value,
         datasetIds: analysableDatasetIds
      });

      if (data !== null) {
         setAnalysisResult(data);
      }
   }

   function goToNextFeature() {
      const id = feature.get('_nextFeature');

      if (!isNil(id)) {
         dispatch(selectFeature({ id, zoom: true }));
      }
   }

   function goToPreviousFeature() {
      const id = feature.get('_prevFeature');

      if (!isNil(id)) {
         dispatch(selectFeature({ id, zoom: true }));
      }
   }

   return (
      map !== null && (feature !== null || featureToEdit !== null) ?
         <div className={`${styles.featureInfo} ${expanded ? styles.featureInfoExpanded : ''}`}>
            <div className={styles.boxContent}>
               <div>
                  {
                     featureToEdit === null ?
                        <>
                           <div className={styles.buttonsTop}>
                              <gn-button>
                                 <button
                                    onClick={zoomToObject}
                                    className={styles.zoom}
                                 >
                                    Gå til
                                 </button>
                              </gn-button>
                              {
                                 featureToEdit === null && feature?.get('_featureType') === 'default' ?
                                    <div className={styles.right}>
                                       {
                                          analysableDatasetIds.length > 0 ?
                                             <gn-button>
                                                <button onClick={analyze} className={styles.analysis}>Analyse</button>
                                             </gn-button> :
                                             null
                                       }
                                       {
                                          canEdit() && (
                                             <gn-button>
                                                <button onClick={edit} className={styles.edit}>Rediger</button>
                                             </gn-button>
                                          )
                                       }
                                    </div> :
                                    null
                              }
                           </div>
                           <Feature feature={feature} />
                        </> :
                        <FeatureForm
                           feature={featureToEdit.clone}
                           metadata={metadata}
                           onSave={save}
                           onCancel={cancel}
                           onDelete={deleteObject}
                        />
                  }
               </div>
               <div className={styles.navigation} style={{ display: featureToEdit === null ? 'flex' : 'none' }}>
                  <div>
                     <gn-button>
                        <button
                           onClick={() => goToPreviousFeature()}
                           disabled={featureToEdit !== null}
                           className={styles.prevButton}
                        >
                        </button>
                     </gn-button>

                     <gn-button>
                        <button
                           onClick={() => goToNextFeature()}
                           disabled={featureToEdit !== null}
                           className={styles.nextButton}
                        >
                        </button>
                     </gn-button>
                  </div>
               </div>
            </div>

            <gn-button>
               <button onClick={toggleExpanded} className={styles.expandButton}>
                  <span></span>
               </button>
            </gn-button>
         </div> :
         null
   );
}

export default FeatureInfo;