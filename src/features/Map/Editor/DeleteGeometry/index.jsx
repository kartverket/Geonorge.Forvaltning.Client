import { useDispatch, useSelector } from 'react-redux';
import { setFeaturesSelected } from 'store/slices/mapSlice';
import { getInteraction, getLayer } from 'utils/helpers/map';
import Delete from 'ol-ext/interaction/Delete';
import SelectGeometry from '../SelectGeometry';
import styles from '../Editor.module.scss';

export default function DeleteGeometry({ map }) {
   const name = DeleteGeometry.interactionName;
   const dispatch = useDispatch();
   const featuresSelected = useSelector(state => state.map.editor.featuresSelected);

   function _delete() {
      const interaction = getInteraction(map, name);
      const selectInteraction = getInteraction(map, SelectGeometry.interactionName);

      interaction.delete(selectInteraction.getFeatures());
      dispatch(setFeaturesSelected(false));
   }

   return (
      <button className={styles.delete} onClick={_delete} disabled={!featuresSelected} title="Slett geometri"></button>
   );
}

DeleteGeometry.interactionName = 'deleteGeometry';

DeleteGeometry.addInteraction = map => {
   if (getInteraction(map, DeleteGeometry.interactionName) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');

   const interaction = new Delete({
      source: vectorLayer.getSource()
   });

   interaction.set('_name', DeleteGeometry.interactionName);
   interaction.setActive(false);

   map.addInteraction(interaction);
};