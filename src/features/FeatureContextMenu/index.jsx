import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectFeature } from 'store/slices/mapSlice';
import { useMap } from 'context/MapProvider';
import { renderProperty } from 'utils/helpers/general';
import { getProperties } from 'utils/helpers/map';
import styles from './FeatureContextMenu.module.scss';

export default function FeatureContextMenu() {
   const { map, contextMenuData: data } = useMap();
   const [visible, setVisible] = useState(false);
   const [posistion, setPosition] = useState({ top: 0, left: 0 });
   const menuElement = useRef(null);
   const dispatch = useDispatch();

   const { handleClickOutside, handleWindowResize, closeMenu } = useMemo(
      () => {
         function handleClickOutside(event) {
            if (menuElement.current && !menuElement.current.contains(event.target)) {
               closeMenu();
            }
         }

         function handleWindowResize() {
            closeMenu();
         }

         function closeMenu() {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleWindowResize);
            data.features.clear();
            setVisible(false);
         }

         return { handleClickOutside, handleWindowResize, closeMenu };
      },
      [data]
   );

   useLayoutEffect(
      () => {
         if (visible && menuElement.current !== null) {
            let top, left;

            // if (data.left + menuElement.current.offsetWidth > map.getTarget().clientWidth) {
            //    left = data.left - menuElement.current.offsetWidth;
            // } else {
            //    left = data.left;
            // }

            // if (data.top + menuElement.current.offsetHeight > map.getTarget().clientHeight) {
            //    top = data.top - menuElement.current.offsetHeight;
            // } else {
            //    top = data.top;
            // }

            top = data.top;
            left = data.left;

            setPosition({ top, left });
         }
      },
      [visible, data, map]
   );

   useEffect(
      () => {
         if (!map || !data) {
            return;
         }

         setVisible(true);
         map.once('movestart', () => closeMenu());
         document.addEventListener('mousedown', handleClickOutside);
         window.addEventListener('resize', handleWindowResize);
      },
      [map, data, handleClickOutside, handleWindowResize, closeMenu]
   );

   function handleFeatureSelect(feature) {
      dispatch(selectFeature({ id: feature.get('id').value, zoom: true }));
      closeMenu();
   }

   function renderTableRow(feature) {
      const properties = getProperties(feature);

      return (
         <tr key={feature.get('id').value} onClick={() => handleFeatureSelect(feature)}>
            {
               Object.entries(properties)
                  .map(entry => <td key={entry[0]}>{renderProperty(entry[1])}</td>)
            }
         </tr>
      );
   }

   function renderTable(data) {
      const features = data.features.getArray();
      const feature = features[0];
      const properties = getProperties(feature);

      return (
         <gn-table hoverable="">
            <table className={styles.table}>
               <thead>
                  <tr>
                     {
                        Object.entries(properties)
                           .map(entry => <th key={entry[0]}>{entry[0]}</th>)
                     }
                  </tr>
               </thead>
               <tbody>
                  {
                     features
                        .map(feature => renderTableRow(feature))
                  }
               </tbody>
            </table>
         </gn-table>
      );
   }

   if (!data) {
      return null;
   }

   return (
      data?.features.getLength() ?
         <div
            ref={menuElement}
            className={`${styles.featureContextMenu} ${visible ? styles.featureContextMenuVisible : ''}`}
            style={{ top: `${posistion.top || 0}px`, left: `${posistion.left || 0}px` }}
         >
            {
               renderTable(data)
            }
         </div> :
         null
   )
}
