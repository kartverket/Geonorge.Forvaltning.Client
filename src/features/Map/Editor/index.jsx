import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMap } from 'context/MapProvider';
import { GeometryType } from 'context/MapProvider/helpers/constants';
import { getInteraction } from 'utils/helpers/map';
import DeleteGeometry from './DeleteGeometry';
import DrawPolygon from './DrawPolygon';
import DrawPolygonHole from './DrawPolygonHole';
import DrawLineString from './DrawLineString';
import ModifyGeometry from './ModifyGeometry';
import SelectGeometry from './SelectGeometry';
import UndoRedo from './UndoRedo';
import styles from './Editor.module.scss';

export default function Editor() {
   const { map } = useMap();
   const [active, setActive] = useState(null);
   const geomType = useSelector(state => state.geomEditor.geomType);

   useEffect(
      () => {
         if (geomType === GeometryType.Polygon) {
            setActive(DrawPolygon.name);
         } else if (geomType === GeometryType.LineString) {
            setActive(DrawLineString.name);
         } else {
            setActive(null);
         }

         const undoRedoInteraction = getInteraction(map, UndoRedo.name);
         undoRedoInteraction.clear();
      },
      [geomType, map]
   );

   function handleClick(name) {
      setActive(name);
   }

   if (map === null) {
      return null;
   }

   return (
      <div className={styles.editor} style={{ display: geomType !== null ? 'flex' : 'none' }}>
         <SelectGeometry map={map} active={active} onClick={handleClick} />
         <div style={{ display: geomType === GeometryType.Polygon ? 'flex' : 'none' }}>
            <DrawPolygon map={map} active={active} onClick={handleClick} />
            <DrawPolygonHole map={map} active={active} onClick={handleClick} />
         </div>
         <div style={{ display: geomType === GeometryType.LineString ? 'flex' : 'none' }}>
            <DrawLineString map={map} active={active} onClick={handleClick} />
         </div>
         <ModifyGeometry map={map} active={active} onClick={handleClick} />
         <div className={styles.separator}></div>
         <DeleteGeometry map={map} />
         <div className={styles.separator}></div>
         <UndoRedo map={map} />
      </div>
   );
}