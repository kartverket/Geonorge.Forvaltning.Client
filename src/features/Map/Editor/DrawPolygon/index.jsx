import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Draw } from 'ol/interaction';
import { GeometryType } from 'context/MapProvider/helpers/constants';
import { getInteraction, readGeometry, writeFeatureObject } from 'utils/helpers/map';
import { createDrawPolygonStyle, getEditedFeature } from '../helpers';
import { featureCollection as createFeatureCollection } from '@turf/helpers';
import getUnion from '@turf/union';
import UndoRedo from '../UndoRedo';
import styles from '../Editor.module.scss';

export default function DrawPolygon({ map, active, onClick }) {
   const interactionRef = useRef(getInteraction(map, DrawPolygon.name));
   const [_active, setActive] = useState(false);
   const featuresSelected = useSelector(state => state.map.editor.featuresSelected);

   useEffect(
      () => {
         interactionRef.current.setActive(active === DrawPolygon.name);
         setActive(active === DrawPolygon.name);
      },
      [active]
   );

   function toggle() {
      onClick(!_active ? DrawPolygon.name : null);
   }

   return (
      <button
         className={`${styles.polygon} ${_active ? styles.active : ''}`}
         onClick={toggle}
         disabled={featuresSelected}
         title="Legg til polygon"
      ></button>
   );
}

DrawPolygon.addInteraction = map => {
   if (getInteraction(map, DrawPolygon.name) !== null) {
      return;
   }

   const interaction = new Draw({
      type: GeometryType.Polygon,
      style: createDrawPolygonStyle()
   });

   interaction.on('drawend', event => {
      const editedFeature = getEditedFeature(map);

      if (editedFeature === null) {
         return;
      }

      const newGeometry = event.feature.getGeometry();
      const existingGeomType = editedFeature.getGeometry().getType();

      if (existingGeomType === GeometryType.Polygon || existingGeomType === GeometryType.MultiPolygon) {
         const featureA = writeFeatureObject(editedFeature, 'EPSG:3857', 'EPSG:4326');
         const featureB = writeFeatureObject(event.feature, 'EPSG:3857', 'EPSG:4326');
         const featureCollection = createFeatureCollection([featureA, featureB]);
         const union = getUnion(featureCollection);
         const unionGeometry = readGeometry(union.geometry, 'EPSG:4326', 'EPSG:3857');

         editedFeature.setGeometry(unionGeometry);
      } else {
         editedFeature.setGeometry(newGeometry);
      }
   });

   // interaction.on('drawend', event => {
   //    // const source = vectorLayer.getSource();
   //    // const features = source.getFeatures();
   //    // let newGeometry;

   //    // if (features.length === 0) {
   //    //    newGeometry = event.feature.getGeometry();
   //    // } else {
   //    //    const featureCollection = writeFeaturesObject(features);
   //    //    const feature = writeFeatureObject(event.feature);

   //    //    featureCollection.features.push(feature);
   //    //    const unionized = union(featureCollection);
   //    //    newGeometry = readGeometry(unionized.geometry);
   //    // }

   //    // const existing = features[0];
   //    // const existingGeometry = writeGeometryObject(existing?.getGeometry());

   //    // if (features.length === 0) {
   //    //    const newFeature = new Feature({ geometry: newGeometry });
   //    //    source.addFeature(newFeature);
   //    // } else {
   //    //    existing.setGeometry(newGeometry);
   //    // }

   //    // const undoRedoInteraction = getInteraction(map, UndoRedo.interactionName);
   //    // undoRedoInteraction.push('replaceGeometry', { before: existingGeometry, after: writeGeometryObject(newGeometry) });  
   // });

   interaction.set('_name', DrawPolygon.name);
   interaction.setActive(false);

   map.addInteraction(interaction);
};