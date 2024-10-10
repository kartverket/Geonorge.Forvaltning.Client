import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFeaturesSelected } from 'store/slices/mapSlice';
import { getInteraction, getLayer } from 'utils/helpers/map';
import Delete from 'ol-ext/interaction/Delete';
import SelectGeometry from '../SelectGeometry';
import styles from '../Editor.module.scss';

export default function DeleteGeometry({ map }) {
   const interactionRef = useRef(getInteraction(map, DeleteGeometry.name));
   const dispatch = useDispatch();
   const featuresSelected = useSelector(state => state.map.editor.featuresSelected);

   function _delete() {
      const selectInteraction = getInteraction(map, SelectGeometry.name);

      interactionRef.current.delete(selectInteraction.getFeatures());
      dispatch(setFeaturesSelected(false));
   }

   return (
      <button className={styles.delete} onClick={_delete} disabled={!featuresSelected} title="Slett geometri"></button>
   );
}

DeleteGeometry.addInteraction = map => {
   if (getInteraction(map, DeleteGeometry.name) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features-edit');

   const interaction = new Delete({
      source: vectorLayer.getSource()
   });

   interaction.set('_name', DeleteGeometry.name);
   interaction.setActive(false);

   map.addInteraction(interaction);
};