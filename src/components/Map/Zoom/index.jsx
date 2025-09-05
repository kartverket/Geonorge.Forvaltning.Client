import styles from "./Zoom.module.scss";

export default function Zoom({ map, className = "" }) {
   function zoomIn() {
      const view = map.getView();
      const maxZoom = view.getMaxZoom();
      let zoom = view.getZoom() + 1;

      if (zoom > maxZoom) {
         zoom = maxZoom;
      }

      view.animate({
         zoom,
         duration: 250,
      });
   }

   function zoomOut() {
      const view = map.getView();
      const minZoom = view.getMinZoom();
      let zoom = view.getZoom() - 1;

      if (zoom < minZoom) {
         zoom = minZoom;
      }

      view.animate({
         zoom,
         duration: 250,
      });
   }

   return (
      <div className={`${styles.zoomControl} ${className}`}>
         <button
            className={styles.zoomIn}
            onClick={zoomIn}
            title="Zoom inn"
         ></button>
         <div className={styles.divider}></div>
         <button
            className={styles.zoomOut}
            onClick={zoomOut}
            title="Zoom ut"
         ></button>
      </div>
   );
}
