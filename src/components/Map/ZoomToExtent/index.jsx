import { useDataset } from "context/DatasetProvider";
import { getLayer } from "utils/helpers/map";
import styles from "./ZoomToExtent.module.scss";

export default function ZoomToExtent({ map }) {
   const { activeDatasetId } = useDataset();

   if (!activeDatasetId) return null;

   function zoomToExtent() {
      const vectorLayer = getLayer(map, activeDatasetId);
      const vectorSource = vectorLayer.getSource();
      const features = vectorSource.getFeatures();

      if (features.length > 0) {
         const extent = vectorLayer.getSource().getExtent();
         const view = map.getView();

         view.fit(extent, map.getSize());
      }
   }

   return (
      <button
         className={styles.button}
         onClick={zoomToExtent}
         title="Zoom til kartets utstrekning for aktivt lag"
      ></button>
   );
}
