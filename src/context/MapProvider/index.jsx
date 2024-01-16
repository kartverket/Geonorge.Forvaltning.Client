import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useDataset } from 'context/DatasetProvider';
import createMap from 'utils/map';

export default function MapProvider({ children }) {
   const { featureCollection } = useDataset();
   const [map, setMap] = useState(null);
   const [contextMenuData, setContextMenuData] = useState(null);
   const initRef = useRef(true);

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

   return (
      <MapContext.Provider value={{ map, setMap, contextMenuData, setContextMenuData }}>
         {children}
      </MapContext.Provider>
   );
}

export const MapContext = createContext({});
export const useMap = () => useContext(MapContext);