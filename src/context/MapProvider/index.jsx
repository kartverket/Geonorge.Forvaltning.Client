import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useDataset } from 'context/DatasetProvider';
import createMap from './helpers/map';
import { useSelector } from 'react-redux';
import { getDataset } from 'store/services/loaders';
import { createFeatureCollectionGeoJson } from 'context/DatasetProvider/helpers';
import { createSecondaryFeaturesLayer } from './helpers/feature';
import { getLayer } from 'utils/helpers/map';

const CRITICAL_USERS_DATASET_ID = 76;

export default function MapProvider({ children }) {
   const { featureCollection } = useDataset();
   const [map, setMap] = useState(null);
   const initRef = useRef(true);
   const showCriticalUsers = useSelector(state => state.map.showCriticalUsers);

   useEffect(
      () => {
         if (!featureCollection || !initRef.current) {
            return;
         }

         initRef.current = false;
         
         (async () => {
            setMap(await createMap(featureCollection));
         })();
      },
      [featureCollection]
   );

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         if (!showCriticalUsers) {
            const vectorLayer = getLayer(map, 'secondary-features');
            
            if (vectorLayer !== null) {
               vectorLayer.setVisible(false);
            }
         } else {
            const vectorLayer = getLayer(map, 'secondary-features');
            
            if (vectorLayer !== null) {
               vectorLayer.setVisible(true);
            } else {
               (async () => {
                  const dataset = await getDataset({ params: { id: CRITICAL_USERS_DATASET_ID } });
                  const featureCollection = createFeatureCollectionGeoJson(dataset);
                  const featuresLayer = createSecondaryFeaturesLayer(featureCollection);
      
                  map.addLayer(featuresLayer);
               })();
            }
         }
      },
      [map, showCriticalUsers]
   );

   return (
      <MapContext.Provider value={{ map, setMap }}>
         {children}
      </MapContext.Provider>
   );
}

export const MapContext = createContext({});
export const useMap = () => useContext(MapContext);