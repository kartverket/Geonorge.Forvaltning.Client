import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMap } from "context/MapProvider";
import { useModal } from "context/ModalProvider";
import { useSignalR } from "context/SignalRProvider";
import { selectFeature, toggleEditMode } from "store/slices/mapSlice";
import {
   initializeDataObject,
   deleteDataObjects,
   updateDataObject,
} from "store/slices/objectSlice";
import {
   getFeatureById,
   getFeatureById2,
   getLayer,
   getProperties,
   getPropertyValue,
   zoomToFeature,
} from "utils/helpers/map";
import {
   addFeatureToMap,
   createFeature,
   highlightFeature,
   removeFeatureFromMap,
   setNextAndPreviousFeatureId,
   toggleFeature,
} from "context/MapProvider/helpers/feature";
import {
   useAddDatasetObjectMutation,
   useDeleteDatasetObjectsMutation,
   useUpdateDatasetObjectMutation,
} from "store/services/api";
import { deleteFeatures } from "utils/helpers/general";
import { updateFeature } from "./helpers";
import { modalType } from "components/Modals";
import { useDataset } from "context/DatasetProvider";
import { createFeatureGeoJson } from "context/DatasetProvider/helpers";
import { messageType } from "config/messageHandlers";
import { isNil } from "lodash";
import environment from "config/environment";
import FeatureForm from "./FeatureForm";
import Feature from "./Feature";
import styles from "./FeatureInfo.module.scss";
import { RemoteEditor } from "components";

function FeatureInfo() {
   const { activeDatasetId, datasets, analysableDatasetIds } = useDataset();
   const definition = datasets[activeDatasetId]?.definition;
   const metadata = datasets[activeDatasetId]?.metadata;
   const { map, setAnalysisResult } = useMap();
   const { showModal } = useModal();
   const { connectionId, send } = useSignalR();
   const [expanded, setExpanded] = useState(false);
   const [feature, setFeature] = useState(null);
   const [featureToEdit, setFeatureToEdit] = useState(null);
   const [add] = useAddDatasetObjectMutation();
   const [update] = useUpdateDatasetObjectMutation();
   const [_delete] = useDeleteDatasetObjectsMutation();
   const selectedFeature = useSelector((state) => state.map.selectedFeature);
   const initializedDataObject = useSelector(
      (state) => state.object.initializedDataObject
   );
   const createdDataObject = useSelector(
      (state) => state.object.createdDataObject
   );
   const updatedDataObject = useSelector(
      (state) => state.object.updatedDataObject
   );
   const deletedDataObjects = useSelector(
      (state) => state.object.deletedDataObjects
   );
   const editedDataObjects = useSelector(
      (state) => state.object.editedDataObjects
   );
   const user = useSelector((state) => state.app.user);
   const dispatch = useDispatch();

   const startEditMode = useCallback(
      (feature) => {
         const clone = feature.clone();
         const vectorLayer = getLayer(map, "features-edit");
         const vectorSource = vectorLayer.getSource();

         vectorSource.addFeature(clone);
         setFeatureToEdit({ original: feature, clone });
         toggleFeature(feature);
         dispatch(toggleEditMode(true));

         send(messageType.SendObjectEdited, {
            datasetId: definition.Id,
            objectId: feature.get("id").value,
         });
      },
      [map, dispatch, send, definition.Id]
   );

   function exitEditMode() {
      const vectorLayer = getLayer(map, "features-edit");
      const vectorSource = vectorLayer.getSource();

      vectorSource.clear();
      toggleFeature(featureToEdit.original);
      setFeatureToEdit(null);
      dispatch(toggleEditMode(false));

      send(messageType.SendObjectEdited, {
         datasetId: definition.Id,
      });
   }

   useEffect(() => {
      if (map !== null && selectedFeature !== null && activeDatasetId) {
         const _feature = getFeatureById2(
            map,
            activeDatasetId,
            selectedFeature.id
         );

         if (_feature) {
            setFeature(_feature);
            setExpanded(true);
         }
      } else {
         setFeature(null);
         setExpanded(false);
      }
   }, [selectedFeature, map, activeDatasetId]);

   useEffect(() => {
      if (map === null || initializedDataObject === null) {
         return;
      }

      const feature = createFeature(initializedDataObject.geoJson);
      feature.set("_geomType", initializedDataObject.type);

      addFeatureToMap(map, feature);
      highlightFeature(map, activeDatasetId, feature);
      startEditMode(feature);
      setExpanded(true);
   }, [initializedDataObject, map, activeDatasetId, startEditMode]);

   useEffect(() => {
      if (
         map === null ||
         createdDataObject === null ||
         createdDataObject.datasetId !== definition.Id
      ) {
         return;
      }

      const geoJson = createFeatureGeoJson(metadata, createdDataObject.object);
      const feature = createFeature(
         geoJson,
         `EPSG:${environment.DATASET_SRID}`
      );

      addFeatureToMap(map, feature);
   }, [createdDataObject, definition.Id, metadata, map]);

   useEffect(() => {
      if (map === null || updatedDataObject === null) {
         return;
      }

      const updated = updateFeature(activeDatasetId, updatedDataObject, map);

      if (
         updated !== null &&
         feature !== null &&
         updatedDataObject.id === getPropertyValue(feature, "id")
      ) {
         setFeature(updated);
      }
   }, [updatedDataObject, map, activeDatasetId, feature]);

   useEffect(() => {
      if (
         map === null ||
         deletedDataObjects === null ||
         deletedDataObjects.datasetId !== definition.Id ||
         !deletedDataObjects.ids.length
      ) {
         return;
      }

      deleteFeatures(activeDatasetId, deletedDataObjects.ids, map);

      if (
         selectedFeature !== null &&
         deletedDataObjects.ids.includes(selectedFeature.id)
      ) {
         dispatch(deleteDataObjects(null));
         dispatch(selectFeature(null));
      }
   }, [deletedDataObjects, definition.Id, selectedFeature, map, dispatch]);

   const remoteEditor = useMemo(() => {
      if (feature === null || editedDataObjects.length === 0) {
         return null;
      }

      const featureId = feature.get("id").value;
      const dataObject = editedDataObjects.find(
         (dataObject) =>
            dataObject.objectId === featureId &&
            dataObject.connectionId !== connectionId
      );

      return dataObject !== undefined
         ? { username: dataObject.username, color: dataObject.color }
         : null;
   }, [editedDataObjects, feature, connectionId]);

   async function addObject(payload) {
      try {
         const response = await add({
            payload,
            tableId: definition.Id,
            ownerOrg: definition.Organization,
            definition: definition,
         }).unwrap();

         const properties = getProperties(featureToEdit.clone.getProperties());
         featureToEdit.original.setProperties(properties, true);
         featureToEdit.original.setGeometry(featureToEdit.clone.getGeometry());
         featureToEdit.original.set("id", { name: "ID", value: response.id });

         setFeature(featureToEdit.original);
         setNextAndPreviousFeatureId(
            map,
            activeDatasetId,
            featureToEdit.original
         );
         exitEditMode();

         dispatch(initializeDataObject(null));
         dispatch(selectFeature({ id: response.id, zoom: true }));

         await send(messageType.SendObjectCreated, {
            datasetId: definition.Id,
            object: response,
         });
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: "error",
            title: "Feil",
            body: "Kunne ikke legge til nytt objekt.",
         });
      }
   }

   async function updateObject(id, payload) {
      try {
         await update({
            payload,
            tableId: definition.Id,
            ownerOrg: definition.Organization,
            definition: definition,
         }).unwrap();

         exitEditMode();
         dispatch(updateDataObject({ id, properties: payload }));

         await send(messageType.SendObjectUpdated, {
            objectId: id,
            datasetId: definition.Id,
            properties: payload,
         });
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: "error",
            title: "Feil",
            body: "Kunne ikke oppdatere objekt.",
         });
      }
   }

   async function deleteObject(id) {
      const { result } = await showModal({
         type: modalType.CONFIRM,
         title: "Slett objekt",
         body: "Er du sikker på at du vil slette objektet?",
         okText: "Slett",
      });

      if (!result) {
         return;
      }

      try {
         await _delete({
            ids: [id],
            tableId: definition.Id,
         }).unwrap();

         removeFeatureFromMap(map, featureToEdit.original, "features");
         exitEditMode();

         dispatch(deleteDataObjects({ datasetId: definition.Id, ids: [id] }));

         await send(messageType.SendObjectsDeleted, {
            datasetId: definition.Id,
            ids: [id],
         });
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: "error",
            title: "Feil",
            body: "Kunne ikke slette objekt.",
         });
      }
   }

   function canEdit() {
      return (
         user !== null &&
         remoteEditor === null &&
         (definition.Viewers === null ||
            !definition.Viewers.includes(user.organization) ||
            hasPropertyAccess(feature, definition))
      );
   }

   function hasPropertyAccess(feature, definition) {
      return definition.ForvaltningsObjektPropertiesMetadata.some(
         (property) => {
            const inputName = feature.get(property.ColumnName).name;
            const inputValue = feature.get(property.ColumnName).value;

            return property.AccessByProperties.some(
               (access) =>
                  property.Name == inputName && access.Value === inputValue
            );
         }
      );
   }

   function edit() {
      startEditMode(feature);
   }

   async function save(payload) {
      const featureId = featureToEdit.clone.get("id").value;

      if (payload === null) {
         exitEditMode();
      } else if (featureId === null) {
         await addObject(payload);
      } else {
         await updateObject(featureId, payload);
      }
   }

   function cancel() {
      const isNewObject = featureToEdit.clone.get("id").value === null;

      if (isNewObject) {
         dispatch(initializeDataObject(null));
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
         objectId: feature.get("id").value,
         datasetIds: analysableDatasetIds,
      });

      if (data !== null) {
         setAnalysisResult(data);
      }
   }

   function goToNextFeature() {
      const id = feature.get("_nextFeature");

      if (!isNil(id)) {
         dispatch(selectFeature({ id, zoom: true }));
      }
   }

   function goToPreviousFeature() {
      const id = feature.get("_prevFeature");

      if (!isNil(id)) {
         dispatch(selectFeature({ id, zoom: true }));
      }
   }

   return map !== null && (feature !== null || featureToEdit !== null) ? (
      <div
         className={`${styles.featureInfo} ${
            expanded ? styles.featureInfoExpanded : ""
         }`}
      >
         <gn-button>
            <button onClick={toggleExpanded} className={styles.expandButton}>
               <span></span>
            </button>
         </gn-button>

         <div className={styles.boxContent}>
            <div>
               {featureToEdit === null ? (
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

                        {featureToEdit === null &&
                        feature?.get("_featureType") === "default" ? (
                           <div className={styles.right}>
                              {remoteEditor !== null && (
                                 <RemoteEditor
                                    editor={remoteEditor}
                                    className={styles.remoteEditor}
                                 />
                              )}

                              {analysableDatasetIds.length > 0 ? (
                                 <gn-button>
                                    <button
                                       onClick={analyze}
                                       className={styles.analysis}
                                    >
                                       Analyse
                                    </button>
                                 </gn-button>
                              ) : null}

                              {canEdit() && (
                                 <gn-button>
                                    <button
                                       onClick={edit}
                                       className={styles.edit}
                                    >
                                       Rediger
                                    </button>
                                 </gn-button>
                              )}
                           </div>
                        ) : null}
                     </div>

                     <Feature feature={feature} />
                  </>
               ) : (
                  <FeatureForm
                     feature={featureToEdit.clone}
                     metadata={metadata}
                     onSave={save}
                     onCancel={cancel}
                     onDelete={deleteObject}
                  />
               )}
            </div>
            <div
               className={styles.navigation}
               style={{ display: featureToEdit === null ? "flex" : "none" }}
            >
               <div>
                  <gn-button>
                     <button
                        onClick={() => goToPreviousFeature()}
                        disabled={featureToEdit !== null}
                        className={styles.prevButton}
                     ></button>
                  </gn-button>

                  <gn-button>
                     <button
                        onClick={() => goToNextFeature()}
                        disabled={featureToEdit !== null}
                        className={styles.nextButton}
                     ></button>
                  </gn-button>
               </div>
            </div>
         </div>
      </div>
   ) : null;
}

export default FeatureInfo;
