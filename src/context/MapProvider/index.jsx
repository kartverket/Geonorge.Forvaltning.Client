import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useDataset } from 'context/DatasetProvider';
import { addInteractions } from 'features/Map/Editor/helpers';
import createMap from './helpers/map';

export default function MapProvider({ children }) {
   const { featureCollection } = useDataset();
   const [map, setMap] = useState(null);
   const [analysisResult, setAnalysisResult] = useState(null);
   const initRef = useRef(true);

   useEffect(
      () => {
         if (!featureCollection || !initRef.current) {
            return;
         }

         initRef.current = false;
         
         (async () => {
            const olMap = await createMap(featureCollection);

            addInteractions(olMap);
            setMap(olMap);
         })();
      },
      [featureCollection]
   );

   return (
      <MapContext.Provider value={{ map, analysisResult, setAnalysisResult }}>
         {children}
      </MapContext.Provider>
   );
}

export const MapContext = createContext({});
export const useMap = () => useContext(MapContext);