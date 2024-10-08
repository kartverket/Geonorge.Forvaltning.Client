import { useEffect, useState } from 'react';
import { useMap } from 'context/MapProvider';
import { getLayer } from 'utils/helpers/map';
import DeleteGeometry from './DeleteGeometry';
import DrawPolygon from './DrawPolygon';
import DrawPolygonHole from './DrawPolygonHole';
import ModifyGeometry from './ModifyGeometry';
import SelectGeometry from './SelectGeometry';
import UndoRedo from './UndoRedo';
import styles from './Editor.module.scss';
import { useSelector } from 'react-redux';

export default function Editor() {
   const { map } = useMap();
   const [active, setActive] = useState('selectGeometry');
   const showEditor = useSelector(state => state.map.editor.show);

   useEffect(
      () => {
         if (!showEditor) {
            setActive(null);
         }
      },
      [showEditor]
   );

   function handleClick(name) {
      setActive(name);
   }

   function clearAll() {
      const vectorLayer = getLayer(map, 'features');
      const vectorSource = vectorLayer.getSource();
      const features = vectorSource.getFeatures();

      if (features.length > 0) {
         vectorSource.clear();
      }
   }

   if (map === null) {
      return null;
   }

   return (
      <div className={styles.editor}>
         <SelectGeometry map={map} active={active} onClick={handleClick} />
         <DrawPolygon map={map} active={active} onClick={handleClick} />
         <DrawPolygonHole map={map} active={active} onClick={handleClick} />
         <ModifyGeometry map={map} active={active} onClick={handleClick} />
         <div className={styles.separator}></div>
         <button onClick={clearAll} className={styles.clearAll} title="Start på nytt" />
         <DeleteGeometry map={map} />
         <div className={styles.separator}></div>
         <UndoRedo map={map} />
      </div>
   );
}