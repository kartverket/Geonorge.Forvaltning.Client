import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMap } from 'context/MapProvider';
import { useDataset } from 'context/DatasetProvider';
import { createDataObject } from 'store/slices/objectSlice';
import { createFeatureGeoJson } from 'context/DatasetProvider/helpers';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import { point as createPoint } from '@turf/helpers';
import { GeometryType } from 'context/MapProvider/helpers/constants';
import styles from './MapContextMenu.module.scss';

export default function MapContextMenu() {
   const { map } = useMap();
   const { definition, metadata } = useDataset();
   const [open, setOpen] = useState(false);
   const menuData = useSelector(state => state.map.mapContextMenuData);
   const user = useSelector(state => state.app.user);
   const dispatch = useDispatch();

   useEffect(
      () => {
         if (map === null || definition.Viewers !== null && definition.Viewers.includes(user?.organization)) {
            return;
         }

         setOpen(menuData !== null);

         if (menuData !== null) {
            map.once('movestart', () => setOpen(false));
         }
      },
      [menuData, map, definition.Viewers, user?.organization]
   );

   function addPoint() {
      const geoJson = createFeatureGeoJson(metadata);
      const point = createPoint(menuData.coordinates);

      geoJson.geometry = point.geometry;
      geoJson.properties._coordinates = menuData.lonLat;

      dispatch(createDataObject({ geoJson, type: GeometryType.Point }));
   }

   function addLineString() {
      const geoJson = createFeatureGeoJson(metadata);

      dispatch(createDataObject({ geoJson, type: GeometryType.LineString }));
   }

   function addPolygon() {
      const geoJson = createFeatureGeoJson(metadata);

      dispatch(createDataObject({ geoJson, type: GeometryType.Polygon }));
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
         <li className={styles.header}>Legg til:</li>
         <MenuItem onClick={addPoint}>
            <span className={`${styles.addButton} ${styles.addPoint}`}>Punkt</span>
         </MenuItem>
         <MenuItem onClick={addLineString}>
            <span className={`${styles.addButton} ${styles.addLineString}`}>Linje</span>
         </MenuItem>
         <MenuItem onClick={addPolygon}>
            <span className={`${styles.addButton} ${styles.addPolygon}`}>Polygon</span>
         </MenuItem>
      </ControlledMenu>
   );
}
