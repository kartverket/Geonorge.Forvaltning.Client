import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import { useSelector } from "react-redux";
import {
   useGetAnalysableDatasetIdsQuery,
   useGetDatasetQuery,
   useLazyGetDatasetQuery,
} from "store/services/api";
import {
   createFeatureCollectionGeoJson,
   getAllowedValuesForUser,
} from "./helpers";

export default function DatasetProvider({ children }) {
   const [visibleDatasetIds, setVisibleDatasetIds] = useState([]);
   const [activeDatasetId, setActiveDatasetId] = useState(null);
   const [previousActiveDatasetId, setPreviousActiveDatasetId] = useState(null);
   const [datasets, setDatasets] = useState([]);
   const [loadingDatasetId, setLoadingDatasetId] = useState(null);
   const [getDataset] = useLazyGetDatasetQuery();

   const selectedFeature = useSelector((state) => state.map.selectedFeature);

   const toggleVisibleDataset = (datasetId) => {
      setVisibleDatasetIds((prev) => {
         const next = prev.includes(datasetId)
            ? prev.filter((x) => x !== datasetId)
            : [...prev, datasetId];
         return next;
      });
   };

   const selectActiveDataset = (datasetId) => {
      setActiveDatasetId(datasetId);
      setVisibleDatasetIds((prev) =>
         prev.includes(datasetId) ? prev : [...prev, datasetId]
      );
   };

   useEffect(() => {
      if (visibleDatasetIds.length === 0) return;

      visibleDatasetIds.forEach(async (datasetId) => {
         if (datasets[datasetId]) return;

         setLoadingDatasetId(datasetId);
         const dataset = await getDataset(datasetId).unwrap();
         setLoadingDatasetId(null);

         setDatasets((prev) => ({
            ...prev,
            [datasetId]: dataset,
         }));
      });
   }, [visibleDatasetIds, datasets, getDataset]);

   //    const { objects, definition, metadata, allowedValues } = useDataset();

   // const datasetInfo = { id: dataset.definition.Id };
   // const metadata = dataset.definition.ForvaltningsObjektPropertiesMetadata;
   const ownerOrganization = datasets[activeDatasetId]?.definition.Organization;
   const user = useSelector((state) => state.app.user);
   // const datasetRef = useRef(dataset);

   // const featuresInExtent = useSelector(state => state.map.featuresInExtent);
   // const showObjectsInExtent = useSelector(state => state.object.showObjectsInExtent);
   const { data: analysableDatasetIds = [] } =
      useGetAnalysableDatasetIdsQuery(activeDatasetId);

   const objects = useMemo(
      () => {
         //   if (!showObjectsInExtent) {
         //       return dataset.objects;
         //   }

         //   return featuresInExtent
         //       .map(featureId => dataset.objects.find(object => featureId === object.id))
         //       .filter(object => object !== undefined);
         return datasets[activeDatasetId]
            ? datasets[activeDatasetId].objects
            : [];
      },
      //  [featuresInExtent, dataset.objects, showObjectsInExtent]
      [datasets, activeDatasetId]
   );

   const metadata = useMemo(
      () =>
         datasets[activeDatasetId]?.definition
            .ForvaltningsObjektPropertiesMetadata || [],
      [datasets, activeDatasetId]
   );
   const allowedValues = useMemo(() => {
      const allowed = {};

      metadata.forEach((data) => {
         allowed[data.ColumnName] = getAllowedValuesForUser(
            data.ColumnName,
            metadata,
            user,
            ownerOrganization
         );
      });

      return allowed;
   }, [metadata, user, ownerOrganization]);

   useEffect(() => {
      if (!selectedFeature) return;
      console.log("Selected feature changed:", selectedFeature);
      setActiveDatasetId(selectedFeature.datasetId);
   }, [selectedFeature]);

   useEffect(() => {
      if (activeDatasetId) setPreviousActiveDatasetId(activeDatasetId);
   }, [activeDatasetId]);

   return (
      <DatasetContext.Provider
         value={{
            visibleDatasetIds,
            toggleVisibleDataset,
            activeDatasetId,
            selectActiveDataset,
            previousActiveDatasetId,
            datasets,
            loadingDatasetId,
            dataset: datasets[activeDatasetId],
            objects,
            definition: datasets[activeDatasetId]?.definition,
            metadata,
            allowedValues,
            analysableDatasetIds,
            datasetInfo: datasets[activeDatasetId]?.definition?.Id,
         }}
      >
         {children}
      </DatasetContext.Provider>
   );
}

export const DatasetContext = createContext({});
export const useDataset = () => useContext(DatasetContext);
