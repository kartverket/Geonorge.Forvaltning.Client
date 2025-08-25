import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useDataset } from "context/DatasetProvider";
import { useMap } from "context/MapProvider";
import { useSignalR } from "context/SignalRProvider";
import { selectFeature } from "store/slices/mapSlice";
import { toggleFullscreen as _toggleFullscreen } from "store/slices/appSlice";
import { DEFAULT_ZOOM, getFeatureById, zoomToFeature } from "utils/helpers/map";
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
   const mapElementRef = useRef(null);
   const fullscreen = useSelector((state) => state.app.fullscreen);
   const selectedFeature = useSelector((state) => state.map.selectedFeature);
   const dispatch = useDispatch();

   const [searchParams, setSearchParams] = useSearchParams();

   useLayoutEffect(() => {
      if (!map || !mapElementRef.current) return;

      map.setTarget(mapElementRef.current);
      map.updateSize();
      map.getView().fit(baseMap.extent, {
         duration: 500,
         padding: [50, 50, 50, 50],
         maxZoom: 18,
      });

      return () => {
         map.setTarget(null);
      };
   }, [map]);

   useEffect(() => {
      if (map === null || !selectedFeature) return;

      let feature = getFeatureById(map, activeDatasetId, selectedFeature.id);

      if (feature) {
         setNextAndPreviousFeatureId(map, activeDatasetId, feature);
         highlightFeature(
            map,
            activeDatasetId,
            previousActiveDatasetId,
            feature
         );
         setPreviousActiveDatasetId(activeDatasetId);

         if (selectedFeature.updateUrl) {
            setSearchParams((prev) => {
               const params = new URLSearchParams(prev);
               params.set("datasett", activeDatasetId);
               params.set("objekt", selectedFeature.id);
               return params.toString();
            });
         }

         if (selectedFeature.zoom && feature.getGeometry() !== null) {
            zoomToFeature(
               map,
               feature,
               DEFAULT_ZOOM,
               selectedFeature.disableZoomOut
            );
         }

         return;
      }
   }, [
      selectedFeature,
      activeDatasetId,
      previousActiveDatasetId,
      map,
      setSearchParams,
   ]);

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
