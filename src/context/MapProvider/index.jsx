import {
   createContext,
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

export default function MapProvider({ children }) {
   const {
      visibleDatasets,
      visibleDatasetIds,
      activeDatasetId,
      loadingDatasetIds,
   } = useDataset();

   const layerCacheRef = useRef(new Map());
   const previousTimestamp = useRef(new Map());

   const [map, setMap] = useState(null);

   const [analysisResult, setAnalysisResult] = useState(null);

   useEffect(() => {
      (async () => {
         const map = await createMap();
         addInteractions(map);
         setMap(map);
      })();
   }, []);

   useEffect(() => {
      if (!map) return;

      const cache = layerCacheRef.current;

      visibleDatasets.forEach(({ id, data }) => {
         if (!data?.dataset) return;

         const previousTimestampValue = previousTimestamp.current.get(id);
         const changed =
            previousTimestampValue === undefined ||
            previousTimestampValue !== data.timestamp;

         if (changed) {
            const cachedLayer = cache.get(id);
            if (cachedLayer) map.removeLayer(cachedLayer);

            const featureCollection = createFeatureCollectionGeoJson(
               data?.dataset
            );
            const layer = createFeaturesLayer(id, featureCollection);
            map.addLayer(layer);
            cache.set(id, layer);
            previousTimestamp.current.set(id, data.timestamp);
         }
      });

      [...cache.keys()].forEach((id) => {
         const layer = cache.get(id);
         layer.setVisible?.(visibleDatasetIds.includes(id));

         const activeDataset = activeDatasetId === id;
         layer.setOpacity?.(activeDataset ? 1 : 0.4);
         layer.setZIndex?.(activeDataset ? 3 : 1);
      });
   }, [
      map,
      visibleDatasets,
      visibleDatasetIds,
      loadingDatasetIds,
      activeDatasetId,
   ]);

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
