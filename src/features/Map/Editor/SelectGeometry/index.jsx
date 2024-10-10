import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Select } from 'ol/interaction';
import { getInteraction, getLayer } from 'utils/helpers/map';
import { setFeaturesSelected } from 'store/slices/mapSlice';
import { createSelectGeometryStyle } from '../helpers';
import store from 'store';
import styles from '../Editor.module.scss';

export default function SelectGeometry({ map, active, onClick }) {
   const interactionRef = useRef(getInteraction(map, SelectGeometry.name));
   const [_active, setActive] = useState(false);
   const dispatch = useDispatch();

   useEffect(
      () => {
         const isActive = active === SelectGeometry.name;

         interactionRef.current.setActive(isActive);
         setActive(isActive);

         if (!isActive) {
            interactionRef.current.getFeatures().clear();
            dispatch(setFeaturesSelected(false));
         }
      },
      [active, dispatch]
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

   const vectorLayer = getLayer(map, 'features-edit');

   const interaction = new Select({
      layers: [vectorLayer],
      style: createSelectGeometryStyle()
   });

   interaction.on('select', event => {
      store.dispatch(setFeaturesSelected(event.selected.length > 0));
   });

   interaction.set('_name', SelectGeometry.name);
   interaction.setActive(false);

   map.addInteraction(interaction);
};
