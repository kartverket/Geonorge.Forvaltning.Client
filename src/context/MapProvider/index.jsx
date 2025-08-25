import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import { useDataset } from "context/DatasetProvider";
import createMap from "./helpers/map";
import { addInteractions } from "features/Map/Editor/helpers";
import {
   createFeatureCollectionGeoJson,
   createFeaturesLayer,
} from "./helpers/feature";
import { fitLayerExtentWhenReady } from "./helpers/utils";
import baseMap from "config/map/baseMap";

export default function MapProvider({ children }) {
   const { visibleDatasets, visibleDatasetIds, activeDatasetId } = useDataset();

   const layerCacheRef = useRef(new Map());
   const previousDatasetRef = useRef(new Map());

   const [map, setMap] = useState(null);

   const [analysisResult, setAnalysisResult] = useState(null);

   useEffect(() => {
      (async () => {
         const map = await createMap();
         addInteractions(map);
         setMap(map);
      })();
   }, []);

   const fitLayer = useCallback(
      (layer) => {
         fitLayerExtentWhenReady(map, layer, {
            padding: [50, 50, 50, 50],
            maxZoom: baseMap.maxZoom,
         });
      },
      [map]
   );

   useEffect(() => {
      if (!map) return;

      const cache = layerCacheRef.current;

      visibleDatasets.forEach(({ id, data: dataset }) => {
         if (!dataset) return;

         const changed = previousDatasetRef.current.get(id) !== dataset;

         if (changed) {
            const cachedLayer = cache.get(id);
            if (cachedLayer) map.removeLayer(cachedLayer);

            const featureCollection = createFeatureCollectionGeoJson(dataset);
            const layer = createFeaturesLayer(id, featureCollection);
            map.addLayer(layer);
            cache.set(id, layer);

            previousDatasetRef.current.set(id, dataset);

            fitLayer(layer);
         }
      });

      [...cache.keys()].forEach((id) => {
         const layer = cache.get(id);
         layer.setVisible?.(visibleDatasetIds.includes(id));

         const activeDataset = activeDatasetId === id;
         layer.setOpacity?.(activeDataset ? 1 : 0.4);
         layer.setZIndex?.(activeDataset ? 3 : 1);
      });
   }, [map, visibleDatasets, visibleDatasetIds, activeDatasetId, fitLayer]);

   useEffect(() => {
      if (!map || !activeDatasetId) return;
      const layer = layerCacheRef.current.get(activeDatasetId);
      if (!layer) return;
      fitLayer(layer);
   }, [map, activeDatasetId, fitLayer]);

   const ctx = useMemo(
      () => ({
         map,
         analysisResult,
         setAnalysisResult,
      }),
      [map, analysisResult]
   );

   return <MapContext.Provider value={ctx}>{children}</MapContext.Provider>;
}

export const MapContext = createContext({});
export const useMap = () => useContext(MapContext);
