import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getInteraction, getLayer } from 'utils/helpers/map';
import DrawHole from 'ol-ext/interaction/DrawHole';
import styles from '../Editor.module.scss';

export default function DrawPolygonHole({ map, active, onClick }) {
   const name = DrawPolygonHole.interactionName;
   const [_active, setActive] = useState(false);
   const featuresSelected = useSelector(state => state.map.editor.featuresSelected);

   useEffect(
      () => {
         const interaction = getInteraction(map, name);

         interaction.setActive(active === name);
         setActive(active === name);
      },
      [map, name, active]
   );

   function toggle() {
      onClick(!_active ? name : null);
   }

   return (
      <button
         className={`${styles.polygonHole} ${_active ? styles.active : ''}`}
         onClick={toggle}
         disabled={featuresSelected}
         title="Legg til hull"
      ></button>
   );
}

DrawPolygonHole.interactionName = 'drawPolygonHole';

DrawPolygonHole.addInteraction = map => {
   if (getInteraction(map, DrawPolygonHole.interactionName) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');

   const interaction = new DrawHole({
      layers: [vectorLayer]
   });

   interaction.set('_name', DrawPolygonHole.interactionName);
   interaction.setActive(false);

   map.addInteraction(interaction);
};