import { createContext, useContext, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createFeatureCollectionGeoJson, getAllowedValuesForUser } from './helpers';

export default function DatasetProvider({ dataset, children }) {
   const metadata = dataset.definition.ForvaltningsObjektPropertiesMetadata;
   const user = useSelector(state => state.app.user);
   const datasetRef = useRef(dataset);
   const featureCollection = useMemo(() => createFeatureCollectionGeoJson(datasetRef.current), []);

   const allowedValues = useMemo(
      () => {
         const allowed = {};

         metadata.forEach(data => {
            allowed[data.ColumnName] = getAllowedValuesForUser(data.ColumnName, metadata, user);
         });

         return allowed;
      },
      [metadata, user]
   );

   return (
      <DatasetContext.Provider value={{ objects: dataset.objects, definition: dataset.definition, metadata, featureCollection, allowedValues }}>
         {children}
      </DatasetContext.Provider>
   );
}

export const DatasetContext = createContext({});
export const useDataset = () => useContext(DatasetContext);