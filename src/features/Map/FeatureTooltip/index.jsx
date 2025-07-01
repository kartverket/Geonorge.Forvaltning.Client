import { useCallback, useEffect, useRef } from "react";
import { useMap } from "context/MapProvider";
import { renderProperty } from "utils/helpers/general";
import { getProperties } from "utils/helpers/map";
import styles from "./FeatureTooltip.module.scss";

const listCutoff = 10;

export default function FeatureTooltip() {
   const { map } = useMap();
   const tooltipRef = useRef(null);
   const currentFeatureRef = useRef(null);

   const displayFeatureInfo = useCallback(
      (pixel, target) => {
         let clusterFeature = null;

         if (!target.closest(".ol-control")) {
            clusterFeature = map.forEachFeatureAtPixel(
               pixel,
               (feature) => feature,
               {
                  layerFilter: (layer) => layer.get("id")?.includes("features"),
               }
            );
         }

         map.forEachFeatureAtPixel(pixel, (featureAtPixel, layer) => {
            if (!layer.get("id")?.includes("features")) return false;

            let feature;
            let valueStr = "";

            const features = featureAtPixel
               .get("features")
               .slice()
               .sort((a, b) => {
                  const indexA = +getProperties(a.getProperties()).id.value;
                  const indexB = +getProperties(b.getProperties()).id.value;
                  return indexA - indexB;
               });

            let counter = 0;

            features.some((feature) => {
               const { id, ...properties } = getProperties(
                  feature.getProperties()
               );

               const values = Object.entries(properties)
                  .filter(
                     ([, entry]) =>
                        entry && typeof entry === "object" && "name" in entry
                  )
                  .map((entry) => [entry[1].name, renderProperty(entry[1])]);

               values.unshift(["ID", id.value]);

               valueStr += values
                  .map((value) => `${value[0]}: ${value[1]}`)
                  .join(" | ");

               valueStr += "\n";

               counter++;
               if (counter === listCutoff && features.length > listCutoff)
                  valueStr += `\n(Viser kun de ${listCutoff} første i sortert rekkefølge)`;
               return counter === listCutoff;
            });

            const tooltip = tooltipRef.current;
            tooltip.style.left = pixel[0] + "px";
            tooltip.style.top = pixel[1] + "px";

            if (feature !== currentFeatureRef.current) {
               tooltip.style.visibility = "visible";
               tooltip.textContent = valueStr;
            }

            currentFeatureRef.current = feature;

            return true;
         });

         if (!map.hasFeatureAtPixel(pixel)) {
            tooltipRef.current.style.visibility = "hidden";
            currentFeatureRef.current = null;
         }
      },
      [map]
   );

   useEffect(() => {
      if (map === null) {
         return;
      }

      map.on("pointermove", (event) => {
         const pixel = map.getEventPixel(event.originalEvent);
         displayFeatureInfo(pixel, event.originalEvent.target);
      });

      map.on("click", () => {
         tooltipRef.current.style.visibility = "hidden";
      });
   }, [map, displayFeatureInfo]);

   return <div className={styles.featureInfo} ref={tooltipRef} />;
}
