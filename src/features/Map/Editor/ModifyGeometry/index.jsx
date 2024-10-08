import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getInteraction, getLayer } from 'utils/helpers/map';
import ModifyFeature from 'ol-ext/interaction/ModifyFeature';
import styles from '../Editor.module.scss';

export default function ModifyGeometry({ map, active, onClick }) {
   const name = ModifyGeometry.interactionName;
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
         className={`${styles.modify} ${_active ? styles.active : ''}`}
         onClick={toggle}
         title="Endre geometri"
         disabled={featuresSelected}
      ></button>
   );
}

ModifyGeometry.interactionName = 'modifyGeometry';

ModifyGeometry.addInteraction = map => {
   if (getInteraction(map, ModifyGeometry.interactionName) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');

   const interaction = new ModifyFeature({
      source: vectorLayer.getSource()
   });

   interaction.set('_name', ModifyGeometry.interactionName);
   interaction.setActive(false);

   map.addInteraction(interaction);
};