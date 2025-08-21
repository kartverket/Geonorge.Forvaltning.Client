import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { renderProperty } from "utils/helpers/general";
import { getProperties } from "utils/helpers/map";
import { useUpdateTagMutation } from "store/services/api";
import { useModal } from "context/ModalProvider";
import { useDataset } from "context/DatasetProvider";
import { modalType } from "components/Modals";
import { updateDataObject } from "store/slices/objectSlice";
import { GeometryType } from "context/MapProvider/helpers/constants";
import environment from "config/environment";
import styles from "../FeatureInfo.module.scss";

export default function Feature({ feature }) {
   const dataset = useDataset();
   const [tag, setTag] = useState(feature.get("_tag"));
   const [updateTag] = useUpdateTagMutation();
   const user = useSelector((state) => state.app.user);
   const properties = getProperties(feature.getProperties());
   const coordinates = feature.get("_coordinates");
   const geomType = feature.getGeometry().getType();
   const dispatch = useDispatch();
   const { showModal } = useModal();

   useEffect(() => {
      setTag(feature.get("_tag"));
   }, [feature]);

   async function handleChange(event) {
      const value = event.target.value;
      setTag(value);

      try {
         await updateTag({
            datasetId: environment.TAG_DATASET_ID,
            id: properties.id.value,
            tag: value,
         }).unwrap();
         dispatch(
            updateDataObject({
               id: properties.id.value,
               properties: { tag: value },
            })
         );

         await showModal({
            type: modalType.INFO,
            variant: "success",
            title: "Prioritet oppdatert",
            body: "Prioritet ble oppdatert.",
         });
      } catch (error) {
         console.error(error);

         await showModal({
            type: modalType.INFO,
            variant: "error",
            title: "Feil",
            body: "Prioritet kunne ikke oppdateres.",
         });
      }
   }

   function shouldDisplayTag() {
      return (
         dataset.definition.Id === environment.TAG_DATASET_ID &&
         (user?.organization == dataset.definition.Organization ||
            environment.COUNTY_GOVERNORS.includes(user?.organization))
      );
   }

   console.log(
      Object.entries(properties).filter(
         ([, entry]) => entry && typeof entry === "object" && "name" in entry
      )
   );

   return (
      <div className={styles.properties}>
         {Object.entries(properties)
            .filter(
               ([, entry]) =>
                  entry && typeof entry === "object" && "name" in entry
            )
            .map((entry) => (
               <div key={entry[0]} className={styles.row}>
                  <div className={styles.label}>{entry[1].name}:</div>
                  <div className={styles.value}>
                     <div className={styles.noInput}>
                        {renderProperty(entry[1])}
                     </div>
                  </div>
               </div>
            ))}

         {geomType === GeometryType.Point && coordinates ? (
            <div className={styles.row}>
               <div className={styles.label}>Posisjon:</div>
               <div className={styles.value}>
                  <div className={styles.noInput}>
                     {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
                  </div>
               </div>
            </div>
         ) : null}

         {shouldDisplayTag() && (
            <div className={`${styles.row} ${styles.prioritized}`}>
               <div className={styles.label}>Prioritert:</div>
               <div className={styles.value}>
                  <div>
                     <gn-input>
                        <input
                           type="radio"
                           id="tagJa"
                           name="tag"
                           value="Ja"
                           checked={tag === "Ja"}
                           onChange={handleChange}
                        />
                     </gn-input>

                     <label htmlFor="tagJa">Ja</label>
                  </div>

                  <div>
                     <gn-input>
                        <input
                           type="radio"
                           id="tagNei"
                           name="tag"
                           value="Nei"
                           checked={tag === "Nei"}
                           onChange={handleChange}
                        />
                     </gn-input>

                     <label htmlFor="tagNei">Nei</label>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
