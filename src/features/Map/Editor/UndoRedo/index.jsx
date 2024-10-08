import { getLayer, getInteraction/*, getFeature, readGeometry*/ } from 'utils/helpers/map';
import _UndoRedo from 'ol-ext/interaction/UndoRedo';
import styles from '../Editor.module.scss';

export default function UndoRedo({ map }) {
   const name = UndoRedo.interactionName;

   function undo() {
      const interaction = getInteraction(map, name);
      interaction.undo();
   }

   function redo() {      
      const interaction = getInteraction(map, name);
      interaction.redo();
   }

   return (
      <>
         <button className={styles.undo} onClick={undo} title="Angre"></button>
         <button className={styles.redo} onClick={redo} title="Gjør om"></button>
      </>
   );
}

UndoRedo.interactionName = 'undoRedo';

UndoRedo.addInteraction = map => {
   if (getInteraction(map, UndoRedo.interactionName) !== null) {
      return;
   }

   const vectorLayer = getLayer(map, 'features');
   const interaction = new _UndoRedo({ layers: [vectorLayer] });

   addCustomUndoRedo(interaction, vectorLayer);

   interaction.set('_name', UndoRedo.interactionName);
   interaction.setActive(true);

   map.addInteraction(interaction);
};

function addCustomUndoRedo(interaction, vectorLayer) {
   let _geometry;

   interaction.define(
      'replaceGeometry',
      event => {
         _geometry = event.before;
      },
      event => {
         _geometry = event.after;
      }
   );

   interaction.on(['undo', 'redo'], event => {
      if (event.action.type === 'replaceGeometry') {
         // const feature = getFeature(vectorLayer);
         // feature.setGeometry(readGeometry(_geometry));
      }
   });
}