import { useEffect, useRef, useState } from 'react';
import { Select } from 'ol/interaction';
import { getInteraction, getLayer } from 'utils/helpers/map';
import { setFeaturesSelected } from 'store/slices/mapSlice';
import store from 'store';
import styles from '../Editor.module.scss';

export default function SelectGeometry({ map, active, onClick }) {
   const interactionRef = useRef(getInteraction(map, SelectGeometry.name));
   const [_active, setActive] = useState(false);

   useEffect(
      () => {
         interactionRef.current.setActive(active === SelectGeometry.name);
         setActive(active === SelectGeometry.name);
      },
      [active]
   );

   function toggle() {
      onClick(!_active ? SelectGeometry.name : null);
   }

   return (
      <button
         className={`${styles.select} ${_active ? styles.active : ''}`}
         onClick={toggle}
         title="Velg geometri"
      ></button>
   );
}

SelectGeometry.addInteraction = map => {
   if (getInteraction(map, SelectGeometry.name) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');

   const interaction = new Select({
      layers: [vectorLayer]
   });

   interaction.on('select', event => {
      store.dispatch(setFeaturesSelected(event.selected.length > 0));
   });

   interaction.set('_name', SelectGeometry.name);
   interaction.setActive(false);

   map.addInteraction(interaction);
};
