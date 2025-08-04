import { useDispatch, useSelector } from "react-redux";
import { setFeaturesSelected } from "store/slices/mapSlice";
import { getInteraction, writeGeometryObject } from "utils/helpers/map";
import SelectGeometry from "../SelectGeometry";
import UndoRedo from "../UndoRedo";
import styles from "../Editor.module.scss";

export default function DeleteGeometry({ map }) {
   const dispatch = useDispatch();
   const featuresSelected = useSelector(
      (state) => state.map.editor.featuresSelected
   );

   function _delete() {
      const selectInteraction = getInteraction(map, SelectGeometry.name);
      const feature = selectInteraction.getFeatures().item(0);

      if (feature === undefined) {
         return;
      }

      const undoRedoInteraction = getInteraction(map, UndoRedo.name);
      const geometry = writeGeometryObject(feature.getGeometry());
      selectInteraction.getFeatures().clear();

      feature.setGeometry(null);
      undoRedoInteraction.push("replaceGeometry", {
         before: geometry,
         after: null,
      });
      dispatch(setFeaturesSelected(false));
   }

   return (
      <button
         className={styles.delete}
         onClick={_delete}
         disabled={!featuresSelected}
         title="Slett geometri"
      ></button>
   );
}
