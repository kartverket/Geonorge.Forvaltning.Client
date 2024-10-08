import { useEffect, useState } from 'react';
import { Select } from 'ol/interaction';
import { getInteraction, getLayer } from 'utils/helpers/map';
import { setFeaturesSelected } from 'store/slices/mapSlice';
import store from 'store';
import styles from '../Editor.module.scss';

export default function SelectGeometry({ map, active, onClick }) {
   const name = SelectGeometry.interactionName;
   const [_active, setActive] = useState(false);

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
         className={`${styles.select} ${_active ? styles.active : ''}`}
         onClick={toggle}
         title="Velg geometri"
      ></button>
   );
}

SelectGeometry.interactionName = 'selectGeometry';

SelectGeometry.addInteraction = map => {
   if (getInteraction(map, SelectGeometry.interactionName) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');

   const interaction = new Select({
      layers: [vectorLayer]
   });

   interaction.on('select', event => {
      store.dispatch(setFeaturesSelected(event.selected.length > 0));
   });

   interaction.set('_name', SelectGeometry.interactionName);
   interaction.setActive(false);

   map.addInteraction(interaction);
};