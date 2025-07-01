import { useCallback, useRef, useState } from "react";
import {
   useForm,
   FormProvider,
   Controller,
   useFieldArray,
   useWatch,
} from "react-hook-form";
import { toast } from "react-toastify";
import { isValidOrgNo } from "./helpers";
import { Tags } from "components/Form";
import { fromDbModel, toDbModel } from "./mapper";
import {
   useLazyGetOrganizationNameQuery,
   useSetDatasetAccessMutation,
} from "store/services/api";
import { formatOrgNo } from "utils/helpers/general";
import { Spinner } from "components";
import DatasetAccessProperty from "./DatasetAccessProperty";
import AutocompleteLookup from "components/Form/AutocompleteLookup";
import styles from "./DatasetAccessControlModal.module.scss";

export default function DatasetAccessControlModal({ dataset, onClose }) {
   const methods = useForm({ values: fromDbModel(dataset) });
   const { control, handleSubmit, register } = methods;
   const { fields, append, remove } = useFieldArray({
      control,
      name: "accessByProperties",
   });
   const metadata = dataset.ForvaltningsObjektPropertiesMetadata;
   const [loading, setLoading] = useState(false);
   const [setDatasetAccess] = useSetDatasetAccessMutation();
   const [getOrganizationName] = useLazyGetOrganizationNameQuery();
   const accessControlType = useWatch({ control, name: "accessControlType" });

   const bottomRef = useRef(null);

   const datasetName = dataset.Name;

   function addProperty() {
      append({ propertyId: "", value: "", contributors: [] });

      requestAnimationFrame(() => {
         if (!bottomRef.current) return;
         bottomRef.current.scrollIntoView({ behavior: "smooth" });
      });
   }

   function removeProperty(index) {
      remove(index);
   }

   function submit() {
      handleSubmit(async (dataset) => {
         setLoading(true);

         try {
            const payload = toDbModel(dataset);
            await setDatasetAccess(payload).unwrap();
            setLoading(false);
            toast.success(`Tilganger for ${datasetName} ble oppdatert`);
            onClose();
         } catch (error) {
            setLoading(false);
            toast.error(`Tilganger for ${datasetName} kunne ikke oppdateres`);
         }
      })();
   }

   const formatTag = useCallback(
      async (tag) => {
         const formatted = formatOrgNo(tag);
         const orgName = await getOrganizationName(tag).unwrap();

         return orgName !== null ? (
            <>
               <span className={styles.orgNo}>{formatted}</span>
               {orgName}
            </>
         ) : (
            formatted
         );
      },
      [getOrganizationName]
   );

   return (
      <div className={styles.modal}>
         <heading-text>
            <h1>Tilganger for {dataset.Name}</h1>
         </heading-text>

         <FormProvider {...methods}>
            <div className={styles.body}>
               <div className={styles.heading}>
                  <span>Brukere med lesetilgang </span>
               </div>

               <div className="panel">
                  <gn-label block="">
                     <label htmlFor="viewers">Organisasjon(er)</label>
                  </gn-label>

                  <Controller
                     control={control}
                     name="viewers"
                     render={({ field }) => (
                        <Tags
                           id="viewers"
                           placeholder="Legg til organisasjon..."
                           validator={isValidOrgNo}
                           formatTag={formatTag}
                           className={styles.organizations}
                           {...field}
                        >
                           <AutocompleteLookup />
                        </Tags>
                     )}
                  />
               </div>

               <div className={styles.heading}>
                  <gn-input>
                     <input
                        id="ac-contributors"
                        type="radio"
                        value="contributors"
                        {...register("accessControlType")}
                     />
                  </gn-input>
                  <label htmlFor="ac-contributors">
                     Bidragsytere med redigeringstilgang
                  </label>
               </div>

               <div
                  className={`panel ${
                     accessControlType !== "contributors" ? styles.disabled : ""
                  }`}
               >
                  <gn-label block="">
                     <label htmlFor="contributors">Organisasjon(er)</label>
                  </gn-label>

                  <Controller
                     control={control}
                     name="contributors"
                     render={({ field }) => (
                        <Tags
                           id="contributors"
                           placeholder="Legg til organisasjon..."
                           validator={isValidOrgNo}
                           formatTag={formatTag}
                           className={styles.organizations}
                           {...field}
                        >
                           <AutocompleteLookup />
                        </Tags>
                     )}
                  />
               </div>

               <div className={styles.heading}>
                  <gn-input>
                     <input
                        id="ac-properties"
                        type="radio"
                        value="properties"
                        {...register("accessControlType")}
                     />
                  </gn-input>
                  <label htmlFor="ac-properties">
                     Egenskapsbaserte tilgangsrettigheter
                  </label>
               </div>

               <div
                  className={`${styles.properties} ${
                     accessControlType !== "properties" ? styles.disabled : ""
                  }`}
               >
                  {fields.length > 0 ? (
                     fields.map((field, index) => (
                        <div key={field.id} className="panel">
                           <DatasetAccessProperty
                              index={index}
                              metadata={metadata}
                           />

                           <div className={styles.buttons}>
                              {index === fields.length - 1 && (
                                 <gn-button>
                                    <button
                                       onClick={addProperty}
                                       className={styles.addButton}
                                    >
                                       Legg til egenskap
                                    </button>
                                 </gn-button>
                              )}

                              <gn-button>
                                 <button
                                    onClick={() => removeProperty(index)}
                                    className={styles.removeButton}
                                 >
                                    Fjern egenskap
                                 </button>
                              </gn-button>
                           </div>

                           <div ref={bottomRef} />
                        </div>
                     ))
                  ) : (
                     <div
                        className={`panel ${styles.noProperties} ${styles.buttons}`}
                     >
                        <gn-button>
                           <button
                              onClick={addProperty}
                              className={styles.addButton}
                           >
                              Legg til egenskap
                           </button>
                        </gn-button>
                     </div>
                  )}
               </div>
            </div>

            <div className={styles.modalButtons}>
               <div className={styles.submit}>
                  <gn-button>
                     <button onClick={submit} disabled={loading}>
                        Oppdater tilganger
                     </button>
                  </gn-button>

                  {loading ? (
                     <Spinner
                        style={{
                           position: "absolute",
                           top: "2px",
                           right: "-42px",
                        }}
                     />
                  ) : null}
               </div>

               <gn-button>
                  <button onClick={onClose}>Lukk</button>
               </gn-button>
            </div>
         </FormProvider>
      </div>
   );
}
