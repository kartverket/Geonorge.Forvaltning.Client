import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { getEditLayer, getInteraction, getLayer } from "utils/helpers/map";
import DrawHole from "ol-ext/interaction/DrawHole";
import styles from "../Editor.module.scss";
import { createDrawPolygonHoleStyle } from "../helpers";

export default function DrawPolygonHole({ map, active, onClick }) {
   const interactionRef = useRef(getInteraction(map, DrawPolygonHole.name));
   const [_active, setActive] = useState(false);
   const featuresSelected = useSelector(
      (state) => state.map.editor.featuresSelected
   );

   useEffect(() => {
      interactionRef.current.setActive(active === DrawPolygonHole.name);
      setActive(active === DrawPolygonHole.name);
   }, [active]);

   function toggle() {
      onClick(!_active ? DrawPolygonHole.name : null);
   }

   return (
      <button
         className={`${styles.polygonHole} ${_active ? styles.active : ""}`}
         onClick={toggle}
         disabled={featuresSelected}
         title="Legg til hull"
      ></button>
   );
}

DrawPolygonHole.addInteraction = (map) => {
   if (getInteraction(map, DrawPolygonHole.name) !== null) {
      return;
   }

   const vectorLayer = getEditLayer(map);

   const interaction = new DrawHole({
      layers: [vectorLayer],
      style: createDrawPolygonHoleStyle(),
   });

   interaction.set("_name", DrawPolygonHole.name);
   interaction.setActive(false);

   map.addInteraction(interaction);
};
