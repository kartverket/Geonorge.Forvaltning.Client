import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMap } from 'context/MapProvider';
import { useDataset } from 'context/DatasetProvider';
import { createDataObject } from 'store/slices/objectSlice';
import { createFeatureGeoJson } from 'context/DatasetProvider/helpers';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import { point as createPoint } from '@turf/helpers';
import styles from './MapContextMenu.module.scss';

export default function MapContextMenu() {
   const { map } = useMap();
   const { metadata } = useDataset();
   const [open, setOpen] = useState(false);
   const menuData = useSelector(state => state.map.mapContextMenuData);
   const dispatch = useDispatch();

   useEffect(
      () => {
         if (map === null) {
            return;
         }

         setOpen(menuData !== null);

         if (menuData !== null) {
            map.once('movestart', () => setOpen(false));
         }
      },
      [menuData, map]
   );

   function addObject() {
      const geoJson = createFeatureGeoJson(metadata);
      const point = createPoint(menuData.coordinates);

      geoJson.geometry = point.geometry;
      geoJson.properties._coordinates = menuData.lonLat;

      dispatch(createDataObject(geoJson));
   }

   function renderPosition() {
      if (menuData === null) {
         return null;
      }

      const [lon, lat] = menuData.lonLat;

      return `${lat}, ${lon}`;
   }

   return (
      <ControlledMenu
         anchorPoint={menuData?.pixels}
         onClose={() => setOpen(false)}
         state={open ? 'open' : 'closed'}
         direction="right"
         viewScroll="close"
         className={styles.contextMenu}
      >
         <li className={styles.position}>{renderPosition()}</li>
         <MenuItem onClick={addObject}>
            <span className={styles.addObject}>Nytt objekt</span>
         </MenuItem>
      </ControlledMenu>
   );
}
