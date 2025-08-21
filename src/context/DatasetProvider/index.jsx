import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { api } from "store/services/api";
import {
   getAllowedValuesForUser,
   updateURLSearchParams,
} from "./helpers/access";
import DatasetSubscriptions from "./DatasetSubscriptions";

export default function DatasetProvider({ children }) {
   const [visibleDatasetIds, setVisibleDatasetIds] = useState([]);
   const [activeDatasetId, setActiveDatasetId] = useState(null);

   const dispatch = useDispatch();

   const user = useSelector((s) => s.app.user, shallowEqual);
   const selectedFeature = useSelector(
      (s) => s.map.selectedFeature,
      shallowEqual
   );
   const featuresInExtent = useSelector(
      (s) => s.map.featuresInExtent,
      shallowEqual
   );
   const showObjectsInExtent = useSelector((s) => s.object.showObjectsInExtent);

   const datasets = useSelector((state) => {
      const select = api.endpoints.getDataset.select;
      const datasets = {};

      for (const id of visibleDatasetIds)
         datasets[id] = select(id)(state)?.data;

      return datasets;
   }, shallowEqual);

   const loadingDatasetIds = useSelector((state) => {
      const select = api.endpoints.getDataset.select;
      const out = {};
      for (const id of visibleDatasetIds) {
         const q = select(id)(state) || {};
         out[id] = Boolean(q.isLoading || q.isFetching);
      }
      return out;
   }, shallowEqual);

   const visibleDatasets = useMemo(
      () =>
         visibleDatasetIds
            .map((id) => ({ id, data: datasets[id] }))
            .filter((x) => x.data),
      [visibleDatasetIds, datasets]
   );

   const { data: datasetDefinitions = [] } =
      api.useGetDatasetDefinitionsQuery();

   const { data: activeDataset } = api.useGetDatasetQuery(activeDatasetId, {
      skip: !activeDatasetId,
      refetchOnFocus: true,
      refetchOnReconnect: true,
   });

   const { data: analysableDatasetIds = [] } =
      api.useGetAnalysableDatasetIdsQuery(activeDatasetId, {
         skip: !activeDatasetId,
      });

   useEffect(() => {
      if (!selectedFeature) return;
      dispatch({ type: "setActive", id: selectedFeature.datasetId });
   }, [selectedFeature, dispatch]);

   const metadata = useMemo(() => {
      return (
         activeDataset?.definition?.ForvaltningsObjektPropertiesMetadata || []
      );
   }, [activeDataset]);

   const ownerOrg = activeDataset?.definition?.Organization ?? null;

   const allowedValues = useMemo(() => {
      if (!metadata.length) return {};
      const allowed = {};
      metadata.forEach((m) => {
         allowed[m.ColumnName] = getAllowedValuesForUser(
            m.ColumnName,
            metadata,
            user,
            ownerOrg
         );
      });
      return allowed;
   }, [metadata, user, ownerOrg]);

   const objects = useMemo(() => {
      if (!activeDataset) return [];

      if (!showObjectsInExtent) return activeDataset.objects || [];

      if (!featuresInExtent?.length) return [];

      return featuresInExtent
         .map((fid) => activeDataset.objects.find((o) => o.id === fid))
         .filter(Boolean);
   }, [activeDataset, showObjectsInExtent, featuresInExtent]);

   const toggleVisibleDataset = useCallback(
      (id) => {
         if (
            visibleDatasetIds.length === 0 &&
            !activeDatasetId &&
            activeDatasetId !== id
         ) {
            setActiveDatasetId(id);
         }

         setVisibleDatasetIds((prev) => {
            const next = visibleDatasetIds.includes(id)
               ? prev.filter((x) => x !== id)
               : [...prev, id];
            return next;
         });
      },
      [activeDatasetId, setVisibleDatasetIds, visibleDatasetIds]
   );

   const toggleActiveDataset = useCallback(
      (id) => {
         setActiveDatasetId(id);
         setVisibleDatasetIds((prev) =>
            prev.includes(id) ? prev : [...prev, id]
         );
      },
      [setActiveDatasetId, setVisibleDatasetIds]
   );

   const ctx = useMemo(
      () => ({
         datasetDefinitions,
         visibleDatasets,
         visibleDatasetIds,
         toggleVisibleDataset,
         toggleActiveDataset,
         activeDatasetId,
         loadingDatasetIds,
         activeDataset,
         objects,
         definition: activeDataset?.definition,
         metadata,
         allowedValues,
         analysableDatasetIds,
         datasetInfo: activeDataset
            ? { id: activeDataset.definition?.Id }
            : null,
      }),
      [
         datasetDefinitions,
         visibleDatasets,
         visibleDatasetIds,
         toggleVisibleDataset,
         toggleActiveDataset,
         activeDatasetId,
         loadingDatasetIds,
         activeDataset,
         objects,
         metadata,
         allowedValues,
         analysableDatasetIds,
      ]
   );

   return (
      <DatasetContext.Provider value={ctx}>
         <DatasetSubscriptions ids={visibleDatasetIds} />
         {children}
      </DatasetContext.Provider>
   );
}

export const DatasetContext = createContext({});

export const useDataset = () => useContext(DatasetContext);
