import {
   createContext,
   useContext,
   useEffect,
   useRef,
   useState,
   useMemo,
} from "react";
import { useDataset } from "context/DatasetProvider";
import createMap from "./helpers/map";
import { addInteractions } from "features/Map/Editor/helpers";
import {
   createFeatureCollectionGeoJson,
   createFeaturesLayer,
} from "./helpers/feature";

export default function MapProvider({ children }) {
   const { fetchDataset, visibleDatasetIds, activeDatasetId } = useDataset();

   const layerCacheRef = useRef(new Map());
   const [map, setMap] = useState(null);
   const [datasets, setDatasets] = useState({});

   const [analysisResult, setAnalysisResult] = useState(null);

   useEffect(() => {
      (async () => {
         const map = await createMap();
         addInteractions(map);
         setMap(map);
      })();
   }, []);

   useEffect(() => {
      visibleDatasetIds.forEach((id) => {
         if (datasets[id]) return;

         (async () => {
            const dataset = await fetchDataset(id);

            setDatasets((prevDatasets) => ({
               ...prevDatasets,
               [id]: dataset,
            }));
         })();
      });
   }, [visibleDatasetIds, datasets, fetchDataset]);

   const visibleDatasets = useMemo(
      () =>
         visibleDatasetIds
            .map((id) => ({ id, data: datasets[id] }))
            .filter((x) => x.data),
      [visibleDatasetIds, datasets]
   );

   useEffect(() => {
      if (!map) return;

      const cache = layerCacheRef.current;

      visibleDatasets.forEach(({ id, data }) => {
         console.log("Adding dataset to map", id, data);
         const fc = createFeatureCollectionGeoJson(data);

         if (cache.get(id)) return;

         const layer = createFeaturesLayer(id, fc);
         map.addLayer(layer);
         cache.set(id, layer);
      });

      [...cache.keys()].forEach((id) => {
         if (!visibleDatasetIds.includes(id)) {
            const layer = cache.get(id);
            map.removeLayer(layer);
            cache.delete(id);
         }
      });

      cache.forEach((layer, id) => {
         const isVisible = visibleDatasetIds.includes(id);
         layer.setVisible(isVisible);

         const isActive = activeDatasetId === id;
         layer.setOpacity(isActive ? 1 : 0.4);
         layer.setZIndex(isActive ? 3 : 1);
      });
   }, [map, visibleDatasets, visibleDatasetIds, activeDatasetId]);

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
