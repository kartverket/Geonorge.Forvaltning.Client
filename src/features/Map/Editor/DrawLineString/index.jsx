import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Feature } from 'ol';
import { Draw } from 'ol/interaction';
import { getLayer, /*readGeometry, writeFeatureObject, writeFeaturesObject, writeGeometryObject,*/ getInteraction, getFeatureById, writeFeatureObject, readGeometry, writeGeometryObject } from 'utils/helpers/map';
import { Color, GeometryType } from 'context/MapProvider/helpers/constants';
import { createLineStringFeatureStyle } from 'context/MapProvider/helpers/style';
import union from '@turf/union';
import UndoRedo from '../UndoRedo';
import styles from '../Editor.module.scss';
import { createDrawLineStringStyle, getEditedFeature } from '../helpers';
import combine from '@turf/combine';
import { featureCollection as createFeatureCollection } from '@turf/helpers';

export default function DrawLineString({ map, active, onClick }) {
   const interactionRef = useRef(getInteraction(map, DrawLineString.name));
   const [_active, setActive] = useState(false);
   const featuresSelected = useSelector(state => state.map.editor.featuresSelected);

   useEffect(
      () => {
         interactionRef.current.setActive(active === DrawLineString.name);
         setActive(active === DrawLineString.name);
      },
      [active]
   );

   function toggle() {
      onClick(!_active ? DrawLineString.name : null);
   }

   return (
      <button
         className={`${styles.lineString} ${_active ? styles.active : ''}`}
         onClick={toggle}
         disabled={featuresSelected}
         title="Legg til linje"
      ></button>
   );
}

DrawLineString.addInteraction = map => {
   if (getInteraction(map, DrawLineString.name) !== null) {
      return;
   }

   const interaction = new Draw({
      type: GeometryType.LineString,
      style: createDrawLineStringStyle()
   });

   interaction.on('drawend', event => {
      const editedFeature = getEditedFeature(map);

      if (editedFeature === null) {
         return;
      }

      const existingGeometry = writeGeometryObject(editedFeature.getGeometry());
      let newGeometry;

      if (existingGeometry.type === GeometryType.LineString || existingGeometry.type === GeometryType.MultiLineString) {
         const featureA = writeFeatureObject(editedFeature, 'EPSG:3857', 'EPSG:4326', 6);
         const featureB = writeFeatureObject(event.feature, 'EPSG:3857', 'EPSG:4326', 6);
         const featureCollection = createFeatureCollection([featureA, featureB]);
         const combined = combine(featureCollection);

         newGeometry = readGeometry(combined.features[0].geometry, 'EPSG:4326', 'EPSG:3857');
      } else {
         newGeometry = event.feature.getGeometry();
      }

      debugger
      editedFeature.setGeometry(newGeometry);

      const undoRedoInteraction = getInteraction(map, UndoRedo.name);
      undoRedoInteraction.push('replaceGeometry', { before: existingGeometry, after: writeGeometryObject(newGeometry) });
   });

   interaction.set('_name', DrawLineString.name);
   interaction.setActive(false);

   map.addInteraction(interaction);
};