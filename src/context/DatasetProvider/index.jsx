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
import { getAllowedValuesForUser } from "./helpers/access";

export default function DatasetProvider({ children }) {
   const [visibleDatasetIds, setVisibleDatasetIds] = useState([]);
   const [activeDatasetId, setActiveDatasetId] = useState(null);
   const [loadingId, setLoadingId] = useState(null);

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

   const [triggerDatasetFetch] = api.useLazyGetDatasetQuery();

   const { data: datasetDefinitions = [] } =
      api.useGetDatasetDefinitionsQuery();

   const { data: activeDataset } = api.useGetDatasetQuery(activeDatasetId, {
      skip: !activeDatasetId,
   });

   const { data: analysableDatasetIds = [] } =
      api.useGetAnalysableDatasetIdsQuery(activeDatasetId, {
         skip: !activeDatasetId,
      });

   const fetchDataset = useCallback(
      async (id) => {
         try {
            setLoadingId(id);
            const data = await triggerDatasetFetch(id).unwrap();
            return data;
         } finally {
            setLoadingId(null);
         }
      },
      [triggerDatasetFetch]
   );

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
         setVisibleDatasetIds((prev) => {
            const next = visibleDatasetIds.includes(id)
               ? prev.filter((x) => x !== id)
               : [...prev, id];
            return next;
         });
      },
      [setVisibleDatasetIds, visibleDatasetIds]
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
         fetchDataset,
         visibleDatasetIds,
         toggleVisibleDataset,
         toggleActiveDataset,
         activeDatasetId,
         // previousActiveDatasetId,
         loadingId,
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
         fetchDataset,
         visibleDatasetIds,
         toggleVisibleDataset,
         toggleActiveDataset,
         activeDatasetId,
         loadingId,
         activeDataset,
         objects,
         metadata,
         allowedValues,
         analysableDatasetIds,
      ]
   );

   return (
      <DatasetContext.Provider value={ctx}>{children}</DatasetContext.Provider>
   );
}

export const DatasetContext = createContext({});

export const useDataset = () => useContext(DatasetContext);
