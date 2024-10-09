import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getInteraction, getLayer, getVectorSource } from 'utils/helpers/map';
import { GeometryType } from 'context/MapProvider/helpers/constants';
import ModifyFeature from 'ol-ext/interaction/ModifyFeature';
import styles from '../Editor.module.scss';
import { createModifyGeometryStyle, getEditedFeature } from '../helpers';

export default function ModifyGeometry({ map, active, onClick }) {
   const interactionRef = useRef(getInteraction(map, ModifyGeometry.name));
   const [_active, setActive] = useState(false);
   const featuresSelected = useSelector(state => state.map.editor.featuresSelected);
   const geomType = useSelector(state => state.geomEditor.geomType);

   useEffect(
      () => {
         interactionRef.current.setActive(active === ModifyGeometry.name);
         setActive(active === ModifyGeometry.name);
      },
      [active]
   );

   function toggle() {
      onClick(!_active ? ModifyGeometry.name : null);
   }

   return (
      <button
         className={`${geomType === GeometryType.Polygon ? styles.modifyPolygon : styles.modifyLineString} ${_active ? styles.active : ''}`}
         onClick={toggle}
         title="Endre geometri"
         disabled={featuresSelected}
      ></button>
   );
}

ModifyGeometry.addInteraction = map => {
   if (getInteraction(map, ModifyGeometry.name) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');
   const source = getVectorSource(vectorLayer);
   
   const interaction = new ModifyFeature({
      source,
      style: createModifyGeometryStyle(),
      filter: feature => feature.get('_editing') === true
   });

   interaction.set('_name', ModifyGeometry.name);
   interaction.setActive(false);

   map.addInteraction(interaction);
};