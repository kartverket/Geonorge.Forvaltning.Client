import { createContext, useContext, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGetAnalysableDatasetIdsQuery } from 'store/services/api';
import { createFeatureCollectionGeoJson, getAllowedValuesForUser } from './helpers';

export default function DatasetProvider({ dataset, children }) {
   const datasetInfo = {id : dataset.definition.Id};
   const metadata = dataset.definition.ForvaltningsObjektPropertiesMetadata;
   const ownerOrganization = dataset.definition.Organization;
   const user = useSelector(state => state.app.user);
   const datasetRef = useRef(dataset);
   const featureCollection = useMemo(() => createFeatureCollectionGeoJson(datasetRef.current), []);
   const featuresInExtent = useSelector(state => state.map.featuresInExtent);
   const showObjectsInExtent = useSelector(state => state.object.showObjectsInExtent);
   const { data: analysableDatasetIds = [] } = useGetAnalysableDatasetIdsQuery(dataset.definition.Id);

   const objects = useMemo(
      () => {
         if (!showObjectsInExtent) {
            return dataset.objects;
         }
         
         return featuresInExtent
            .map(featureId => dataset.objects.find(object => featureId === object.id))
            .filter(object => object !== undefined);
      },
      [featuresInExtent, dataset.objects, showObjectsInExtent]
   );

   const allowedValues = useMemo(
      () => {
         const allowed = {};
         
         metadata.forEach(data => {
            allowed[data.ColumnName] = getAllowedValuesForUser(data.ColumnName, metadata, user, ownerOrganization);
         });

         return allowed;
      },
      [metadata, user, ownerOrganization]
   );

   return (
      <DatasetContext.Provider value={{ objects, definition: dataset.definition, metadata, featureCollection, allowedValues, analysableDatasetIds, datasetInfo }}>
         {children}
      </DatasetContext.Provider>
   );
}

export const DatasetContext = createContext({});
export const useDataset = () => useContext(DatasetContext);