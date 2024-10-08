import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Feature } from 'ol';
import { Draw } from 'ol/interaction';
import { getLayer, /*readGeometry, writeFeatureObject, writeFeaturesObject, writeGeometryObject,*/ getInteraction } from 'utils/helpers/map';
import union from '@turf/union';
import UndoRedo from '../UndoRedo';
import styles from '../Editor.module.scss';


export default function DrawPolygon({ map, active, onClick }) {
   const name = DrawPolygon.interactionName;
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
         className={`${styles.polygon} ${_active ? styles.active : ''}`}
         onClick={toggle}
         disabled={featuresSelected}
         title="Legg til polygon"
      ></button>
   );
}

DrawPolygon.interactionName = 'drawPolygon';

DrawPolygon.addInteraction = map => {
   if (getInteraction(map, DrawPolygon.interactionName) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');

   const interaction = new Draw({
      type: 'Polygon'
   });

   interaction.on('drawend', event => {
      // const source = vectorLayer.getSource();
      // const features = source.getFeatures();
      // let newGeometry;

      // if (features.length === 0) {
      //    newGeometry = event.feature.getGeometry();
      // } else {
      //    const featureCollection = writeFeaturesObject(features);
      //    const feature = writeFeatureObject(event.feature);

      //    featureCollection.features.push(feature);
      //    const unionized = union(featureCollection);
      //    newGeometry = readGeometry(unionized.geometry);
      // }

      // const existing = features[0];
      // const existingGeometry = writeGeometryObject(existing?.getGeometry());

      // if (features.length === 0) {
      //    const newFeature = new Feature({ geometry: newGeometry });
      //    source.addFeature(newFeature);
      // } else {
      //    existing.setGeometry(newGeometry);
      // }

      // const undoRedoInteraction = getInteraction(map, UndoRedo.interactionName);
      // undoRedoInteraction.push('replaceGeometry', { before: existingGeometry, after: writeGeometryObject(newGeometry) });  
   });

   interaction.set('_name', DrawPolygon.interactionName);
   interaction.setActive(false);

   map.addInteraction(interaction);
};