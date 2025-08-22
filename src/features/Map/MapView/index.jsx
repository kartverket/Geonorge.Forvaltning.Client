import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { isEmpty as isEmptyExtent } from "ol/extent";
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
   const { activeDataset, activeDatasetId } = useDataset();
   const { send } = useSignalR();
   const { objId } = useParams();
   const mapElementRef = useRef(null);
   const fullscreen = useSelector((state) => state.app.fullscreen);
   const selectedFeature = useSelector((state) => state.map.selectedFeature);
   const dispatch = useDispatch();

   useLayoutEffect(() => {
      if (!map || !mapElementRef.current) return;

      map.setTarget(mapElementRef.current);
      map.updateSize();

      return () => {
         map.setTarget(null);
      };
   }, [map]);

   useEffect(() => {
      if (!map) return;

      // if (!Number.isNaN(objId)) {
      //    dispatch(
      //       selectFeature({
      //          id: Number(objId),
      //          zoom: true,
      //          datasetId: activeDatasetId,
      //       })
      //    );
      //    return;
      // }

      let extent = baseMap.extent;

      if (activeDatasetId) {
         const layer = getLayer(map, activeDatasetId);

         if (layer) {
            const source = getVectorSource(layer);

            if (hasFeatures(map, source)) {
               const srcExtent = source.getExtent();

               if (srcExtent && !isEmptyExtent(srcExtent)) extent = srcExtent;
            }
         }
      }

      map.getView().fit(extent, map.getSize());
   }, [map, activeDatasetId, objId, dispatch]);

   useEffect(() => {
      if (map === null || !selectedFeature) return;

      const feature = getFeatureById2(map, activeDatasetId, selectedFeature.id);

      if (!feature) return;

      setNextAndPreviousFeatureId(map, activeDatasetId, feature);
      highlightFeature(map, activeDatasetId, previousActiveDatasetId, feature);
      setPreviousActiveDatasetId(activeDatasetId);

      if (selectedFeature.updateUrl) {
         const query = `?datasett=${activeDatasetId}&objekt=${selectedFeature.id}`;
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
   }, [selectedFeature, activeDatasetId, previousActiveDatasetId, map]);

   // useEffect(() => {
   //    if (map === null) return;

   //    map.setTarget(mapElementRef.current);

   //    let extent;

   //    if (activeDataset) {
   //       console.log("Extent");
   //       const layer = getLayer(map, activeDatasetId);
   //       if (layer && hasFeatures(map, activeDatasetId)) {
   //          const source = getVectorSource(layer);
   //          extent = source.getExtent();
   //       }
   //    } else {
   //       extent = baseMap.extent;
   //    }

   //    const view = map.getView();

   //    if (!isNaN(objId)) {
   //       dispatch(selectFeature({ id: parseInt(objId), zoom: true }));
   //    } else {
   //       view.fit(extent, map.getSize());

   //       const currentZoom = view.getZoom();

   //       if (currentZoom > baseMap.maxZoom) {
   //          view.setZoom(baseMap.maxZoom);
   //       }
   //    }

   //    return () => {
   //       map.setTarget(null);
   //       map.dispose();
   //       dispatch(selectFeature(null));
   //    };
   // }, [map, dispatch, objId, activeDataset, activeDatasetId]);

   useEffect(() => {
      if (map === null) {
         return;
      }

      const pointerMoved = throttle((event) => {
         if (!event) return;

         send(messageType.SendPointerMoved, {
            datasetId: activeDatasetId,
            coordinate: event.coordinate,
         });
      }, 250);

      map.on("pointermove", pointerMoved);

      return () => map.un("pointermove", pointerMoved);
   }, [map, send, activeDatasetId]);

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

            {map !== null && (
               <div className={styles.editor}>
                  <Editor />
               </div>
            )}
         </div>
      </>
   );
}
