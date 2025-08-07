import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useUpdateDatasetMutation } from "store/services/api";
import { Spinner } from "components";
import DatasetForm from "../DatasetNewModal/DatasetForm";
import { fromDbModel, toDbModel } from "../DatasetNewModal/mapper";
import styles from "./DatasetDefinitionsModal.module.scss";

export default function DatasetDefinitionsModal({ definition, onClose }) {
   const [loading, setLoading] = useState(false);
   const methods = useForm({ defaultValues: fromDbModel(definition) });
   const { handleSubmit } = methods;
   const [updateDataset] = useUpdateDatasetMutation();

   function submit() {
      handleSubmit(async (definition) => {
         setLoading(true);

         try {
            const payload = toDbModel(definition);
            await updateDataset({
               id: definition.id,
               dataset: payload,
            }).unwrap();
            setLoading(false);
            toast.success(`${definition.name} ble oppdatert`);
            onClose();
         } catch (error) {
            setLoading(false);
            toast.error(`${definition.name} kunne ikke oppdateres`);
         }
      })();
   }

   return (
      <div className={styles.modal}>
         <heading-text>
            <h1>Rediger datasett</h1>
         </heading-text>

         <FormProvider {...methods}>
            <div className={styles.body}>
               <DatasetForm />
            </div>

            <div className={styles.buttons}>
               <div className={styles.submit}>
                  <gn-button>
                     <button onClick={submit} disabled={loading}>
                        Oppdater datasett
                     </button>
                  </gn-button>

                  {loading && (
                     <Spinner
                        style={{
                           position: "absolute",
                           top: "2px",
                           right: "-42px",
                        }}
                     />
                  )}
               </div>

               <gn-button>
                  <button onClick={onClose}>Lukk</button>
               </gn-button>
            </div>
         </FormProvider>
      </div>
   );
}
