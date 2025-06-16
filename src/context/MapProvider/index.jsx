import { createContext, useContext, useEffect, useRef, useState } from "react";
import { addInteractions } from "features/Map/Editor/helpers";
import createMap from "./helpers/map";
import { createFeatureCollectionGeoJson } from "context/DatasetProvider/helpers";
import { createFeaturesLayer } from "./helpers/feature";
import { useDataset } from "context/DatasetProvider";

export default function MapProvider({ children }) {
   const [map, setMap] = useState(null);
   const [analysisResult, setAnalysisResult] = useState(null);
   const initRef = useRef(true);
   const layerCache = useRef(new Map());
   const { visibleDatasetIds, activeDatasetId, datasets } = useDataset();

   useEffect(() => {
      if (!initRef.current) return;

      initRef.current = false;

      (async () => {
         const olMap = await createMap();

         addInteractions(olMap);
         setMap(olMap);
      })();
   }, []);

   useEffect(() => {
      if (!map) return;

      visibleDatasetIds.forEach((id) => {
         if (!datasets[id]) return;

         if (layerCache.current.has(id)) return;

         const featureCollection = createFeatureCollectionGeoJson(datasets[id]);
         const layer = createFeaturesLayer(id, featureCollection);

         map.addLayer(layer);
         layerCache.current.set(id, layer);
      });

      layerCache.current.forEach((layer, id) => {
         const existingLayer = map
            .getLayers()
            .getArray()
            .find((l) => l.ol_uid === layer.ol_uid);

         if (!existingLayer) return;

         existingLayer.setVisible(visibleDatasetIds.includes(id));
      });
   }, [map, visibleDatasetIds, datasets]);

   useEffect(() => {
      if (!activeDatasetId) return;

      visibleDatasetIds.forEach((id) => {
         const layer = layerCache.current.get(id);
         if (!layer) return;

         layer.setOpacity(activeDatasetId !== id ? 0.4 : 1);
         layer.setZIndex(activeDatasetId !== id ? 2 : 1);
      });
   }, [visibleDatasetIds, activeDatasetId, datasets]);

   return (
      <MapContext.Provider value={{ map, analysisResult, setAnalysisResult }}>
         {children}
      </MapContext.Provider>
   );
}

export const MapContext = createContext({});
export const useMap = () => useContext(MapContext);
