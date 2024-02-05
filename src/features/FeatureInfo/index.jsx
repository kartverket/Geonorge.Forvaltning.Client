import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRevalidator } from 'react-router-dom';
import { useMap } from 'context/MapProvider';
import { useModal } from 'context/ModalProvider';
import { selectFeature, toggleEditMode } from 'store/slices/mapSlice';
import { createDataObject, deleteDataObjects, updateDataObject } from 'store/slices/objectSlice';
import { getFeatureById, getPropertyValue, hasFeatures, zoomToFeature } from 'utils/helpers/map';
import { addFeatureToMap, createFeature, removeFeatureFromMap, setNextAndPreviousFeatureId, toggleFeature } from 'context/MapProvider/helpers/feature';
import { useAddDatasetObjectMutation, useDeleteDatasetObjectsMutation, useUpdateDatasetObjectMutation } from 'store/services/api';
import { deleteFeatures } from 'utils/helpers/general';
import { toDbModel, updateFeature } from './helpers';
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
   const dispatch = useDispatch();

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
            const feature = createFeature(createdDataObject);

            addFeatureToMap(map, feature, 'selected-features');
            setFeatureToEdit(feature);
            dispatch(toggleEditMode(true));
            setExpanded(true);
         }
      },
      [createdDataObject, map, dispatch]
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

         if (selectedFeature === null || !deletedDataObjects.includes(selectedFeature.id)) {
            deleteFeatures(deletedDataObjects, map);
         } else {
            const feature = getFeatureById(map, selectedFeature.id);
            const featureId = feature.get('_nextFeature') || feature.get('_prevFeature') || null;

            deleteFeatures(deletedDataObjects, map);
            dispatch(deleteDataObjects([]));

            if (hasFeatures(map) && featureId !== null) {
               dispatch(selectFeature({ id: featureId, zoom: true }));
            } else {
               dispatch(selectFeature(null));
            }
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
            ownerOrg: definition.Organization
         }).unwrap();

         revalidator.revalidate();

         featureToEdit.set('id', { name: 'ID', value: response.id });
         setFeature(featureToEdit);

         removeFeatureFromMap(map, featureToEdit, 'selected-features');
         addFeatureToMap(map, featureToEdit);
         setNextAndPreviousFeatureId(map, featureToEdit);
         setFeatureToEdit(null);

         dispatch(createDataObject(null));
         dispatch(toggleEditMode(false));
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
            ownerOrg: definition.Organization
         }).unwrap();

         revalidator.revalidate();

         removeFeatureFromMap(map, featureToEdit, 'selected-features');
         setFeatureToEdit(null);
         toggleFeature(feature);

         dispatch(updateDataObject({ id, properties: payload }));
         dispatch(toggleEditMode(false));
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

         removeFeatureFromMap(map, featureToEdit, 'selected-features');
         setFeatureToEdit(null);

         dispatch(deleteDataObjects([id]));
         dispatch(toggleEditMode(false));
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

   function edit() {
      const clone = feature.clone();

      addFeatureToMap(map, clone, 'selected-features');
      toggleFeature(feature);
      setFeatureToEdit(clone);
      dispatch(toggleEditMode(true));
   }

   async function save() {
      const featureId = getPropertyValue(featureToEdit, 'id');
      const payload = toDbModel(feature, featureToEdit);

      if (payload === null) {
         removeFeatureFromMap(map, featureToEdit, 'selected-features');
         setFeatureToEdit(null);
         toggleFeature(feature);
         dispatch(toggleEditMode(false));
      } else if (featureId === null) {
         await addObject(payload);
      } else {
         await updateObject(featureId, payload);
      }
   }

   function cancel() {
      const createMode = getPropertyValue(featureToEdit, 'id') === null;

      if (createMode) {
         dispatch(createDataObject(null));
      } else {
         toggleFeature(feature);
      }

      removeFeatureFromMap(map, featureToEdit, 'selected-features');
      setFeatureToEdit(null);
      dispatch(toggleEditMode(false));
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
         coordinates: feature.get('_coordinates'),
         datasetIds: analysableDatasetIds
      });

      if (data !== null) {
         setAnalysisResult({ 
            featureId: feature.get('id').value, 
            featureCollection: data 
         });
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
                                 featureToEdit === null && feature.get('_featureType') === 'default' ?
                                    <div className={styles.right}>
                                       {
                                          analysableDatasetIds.length > 0 ?
                                             <gn-button>
                                                <button onClick={analyze} className={styles.analysis}>Analyse</button>
                                             </gn-button> :
                                             null
                                       }
                                       <gn-button>
                                          <button onClick={edit} className={styles.edit}>Rediger</button>
                                       </gn-button>
                                    </div> :
                                    null
                              }
                           </div>
                           <Feature feature={feature} />
                        </> :
                        <FeatureForm
                           feature={featureToEdit}
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