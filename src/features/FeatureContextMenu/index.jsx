import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectFeature } from 'store/slices/mapSlice';
import { useMap } from 'context/MapProvider';
import { renderProperty } from 'utils/helpers/general';
import { getFeaturesById, getProperties } from 'utils/helpers/map';
import { ControlledMenu } from '@szhsin/react-menu';
import styles from './FeatureContextMenu.module.scss';

export default function FeatureContextMenu() {
   const { map } = useMap();
   const [open, setOpen] = useState(false);
   const menuData = useSelector(state => state.map.featureContextMenuData);
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

   function handleFeatureSelect(feature) {
      dispatch(selectFeature({ id: feature.get('id').value, zoom: true }));
   }

   function renderMenuItem(feature) {
      const properties = getProperties(feature);

      return (
         <li
            key={feature.get('id').value}
            onClick={() => handleFeatureSelect(feature)}
         >
            {
               Object.entries(properties)
                  .map(entry => <span key={entry[0]}>{renderProperty(entry[1])}</span>)
            }
         </li>
      );
   }

   function renderMenu() {
      if (map === null || menuData === null) {
         return null;
      }

      const features = getFeaturesById(map, menuData.featureIds);
      const feature = features[0];
      const properties = getProperties(feature);

      return (
         <>
            <li className={styles.header}>
               {Object.entries(properties).map(entry => <span key={entry[0]}>{entry[1].name}</span>)}
            </li>
            {features.map(feature => renderMenuItem(feature))}
         </>
      );
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
         {renderMenu()}
      </ControlledMenu>
   );
}
