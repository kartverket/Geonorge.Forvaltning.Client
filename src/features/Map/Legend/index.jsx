import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useDataset } from "context/DatasetProvider";
import { useMap } from "context/MapProvider";
import { getLayer } from "utils/helpers/map";
import { setStyling } from "store/slices/mapSlice";
import { Select } from "components/Form";
import colorsGenerator from "colors-generator";
import environment from "config/environment";
import styles from "./Legend.module.scss";

export default function Legend() {
   const { activeDatasetId, metadata, datasetInfo } = useDataset();
   const { map } = useMap();
   const [selectedProperty, setSelectedProperty] = useState("");
   const [legend, setLegend] = useState(null);
   const [expanded, setExpanded] = useState(false);
   const dispatch = useDispatch();

   useEffect(() => {
      return () => dispatch(setStyling(null));
   }, [dispatch]);

   const selectOptions = useMemo(() => {
      const options = metadata
         .filter((property) => property.AllowedValues !== null)
         .map((property) => ({
            value: property.ColumnName,
            label: property.Name,
         }));

      options.unshift({ value: "", label: "Velg egenskap" });

      if (datasetInfo.id == environment.TAG_DATASET_ID) {
         options.push({ value: "tag", label: "Prioritert" });
      }

      return options;
   }, [metadata, datasetInfo]);

   function createLegend(propName) {
      if (propName === "tag") {
         return {
            Ja: "#86bff2",
            Nei: "#ff0000",
         };
      }

      const properties = metadata.find(
         (property) => property.ColumnName === propName
      );
      const colors = colorsGenerator
         .generate("#86bff2", properties.AllowedValues.length)
         .get();
      const legend = {};

      properties.AllowedValues.forEach(
         (value, index) => (legend[value] = colors[index])
      );

      return legend;
   }

   function handleChange(event) {
      const vectorLayer = getLayer(map, activeDatasetId);
      const value = event.target.value;

      setSelectedProperty(value);

      if (value !== "") {
         const legend = createLegend(value);
         setLegend(legend);

         dispatch(
            setStyling({ property: value, legend, datasetId: activeDatasetId })
         );
         vectorLayer.changed();
      } else {
         setLegend(null);
         dispatch(setStyling(null));
         vectorLayer.changed();
      }
   }

   useEffect(() => {
      const vectorLayer = getLayer(map, activeDatasetId);
      if (!vectorLayer) return;

      setLegend(null);
      dispatch(setStyling(null));
      vectorLayer.changed();
   }, [activeDatasetId, dispatch, map]);

   if (selectOptions.length <= 1) {
      return null;
   }

   return (
      <div className={`${styles.container} ${expanded ? styles.expanded : ""}`}>
         <button
            onClick={() => setExpanded(!expanded)}
            title={!expanded ? "Vis tegneregler" : "Skjul tegneregler"}
            className={styles.button}
         ></button>

         <div className={styles.legend}>
            <div className={styles.select}>
               <Select
                  value={selectedProperty}
                  options={selectOptions}
                  onChange={handleChange}
                  allowEmpty={false}
               />
            </div>

            {legend !== null && (
               <div className={styles.legendList}>
                  {Object.entries(legend).map((entry) => (
                     <div key={entry[1]} className={styles.item}>
                        <span
                           className={styles.color}
                           style={{ background: entry[1] }}
                        >
                           {entry[0][0].toUpperCase()}
                        </span>
                        <span className={styles.text}>{entry[0]}</span>
                     </div>
                  ))}

                  <div className={styles.item}>
                     <span
                        className={styles.color}
                        style={{ background: "#333333", color: "#ffffff" }}
                     >
                        ?
                     </span>
                     <span className={styles.text}>Ikke angitt</span>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
