import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { useDataset } from "context/DatasetProvider";
import { useMap } from "context/MapProvider";
import { useSignalR } from "context/SignalRProvider";
import { selectFeature } from "store/slices/mapSlice";
import { toggleFullscreen as _toggleFullscreen } from "store/slices/appSlice";
import {
   DEFAULT_ZOOM,
   getFeatureById2,
   getLayer,
   getVectorSource,
   hasFeatures,
   zoomToFeature,
} from "utils/helpers/map";
import {
   highlightFeature,
   setNextAndPreviousFeatureId,
} from "context/MapProvider/helpers/feature";
import { FeatureTooltip, Legend } from "..";
import { Zoom, ZoomToExtent } from "components/Map";
import { messageType } from "config/messageHandlers";
import { throttle } from "lodash";
import baseMap from "config/map/baseMap";
import Editor from "../Editor";
import styles from "./MapView.module.scss";

export default function MapView({ tableExpanded }) {
   const [previousActiveDatasetId, setPreviousActiveDatasetId] = useState(null);
   const { map } = useMap();
   const { activeDataset } = useDataset();
   const { send } = useSignalR();
   const { objId } = useParams();
   const location = useLocation();
   const mapElementRef = useRef(null);
   const selectedFeature = useSelector((state) => state.map.selectedFeature);
   const fullscreen = useSelector((state) => state.app.fullscreen);
   const dispatch = useDispatch();

   useEffect(() => {
      if (map === null) return;

      if (!selectedFeature) {
         if (activeDataset) {
            history.replaceState(
               null,
               document.title,
               `?datasett=${activeDataset.id}`
            );
         }

         return;
      }

      const feature = getFeatureById2(
         map,
         activeDataset.id,
         selectedFeature.id
      );

      if (!feature) {
         if (activeDataset) {
            history.replaceState(
               null,
               document.title,
               `?datasett=${activeDataset.id}`
            );
         }

         return;
      }

      setNextAndPreviousFeatureId(map, activeDataset.id, feature);
      highlightFeature(map, activeDataset.id, previousActiveDatasetId, feature);
      setPreviousActiveDatasetId(activeDataset.id);

      if (selectedFeature.updateUrl) {
         const query = `?datasett=${activeDataset.id}&objekt=${selectedFeature.id}`;
         // const route = `/datasett/${id}/objekt/${selectedFeature.id}`;
         history.replaceState(null, document.title, query);
      }

      if (selectedFeature.zoom && feature.getGeometry() !== null) {
         zoomToFeature(
            map,
            feature,
            DEFAULT_ZOOM,
            selectedFeature.disableZoomOut
         );
      }
   }, [
      selectedFeature,
      activeDataset,
      previousActiveDatasetId,
      map,
      location.pathname,
   ]);

   useEffect(() => {
      if (map === null) {
         return;
      }

      map.setTarget(mapElementRef.current);

      // const layer = getLayer(map, "features");
      // const source = getVectorSource(layer);
      const view = map.getView();
      let extent;

      // if (hasFeatures(map)) {
      //    extent = source.getExtent();
      // } else {
      extent = baseMap.extent;
      // }

      if (!isNaN(objId)) {
         dispatch(selectFeature({ id: parseInt(objId), zoom: true }));
      } else {
         view.fit(extent, map.getSize());

         const currentZoom = view.getZoom();

         if (currentZoom > baseMap.maxZoom) {
            view.setZoom(baseMap.maxZoom);
         }
      }

      return () => {
         map.setTarget(null);
         map.dispose();
         dispatch(selectFeature(null));
      };
   }, [map, dispatch, objId]);

   // useEffect(() => {
   //    if (map === null) {
   //       return;
   //    }

   //    const pointerMoved = throttle((event) => {
   //       send(messageType.SendPointerMoved, {
   //          datasetId: datasetInfo.id,
   //          coordinate: event.coordinate,
   //       });
   //    }, 250);

   //    map.on("pointermove", pointerMoved);

   //    return () => map.un("pointermove", pointerMoved);
   // }, [map, send, datasetInfo.id]);

   function toggleFullscreen() {
      dispatch(_toggleFullscreen(!fullscreen));
   }

   return (
      <>
         <div className={styles.mapContainer}>
            <div
               ref={mapElementRef}
               className={`${styles.map} ${
                  fullscreen && !tableExpanded ? styles.fullscreen : ""
               }`}
            ></div>

            <FeatureTooltip />

            <div className={styles.buttons}>
               <Zoom map={map} />
               <ZoomToExtent map={map} />
               <button
                  className={styles.fullscreenButton}
                  title={
                     !fullscreen ? "Aktiver fullskjerm" : "Deaktiver fullskjerm"
                  }
                  onClick={toggleFullscreen}
               />

               {activeDataset && <Legend />}
            </div>

            {/* {map !== null && (
               <div className={styles.editor}>
                  <Editor />
               </div>
            )} */}
         </div>
      </>
   );
}
