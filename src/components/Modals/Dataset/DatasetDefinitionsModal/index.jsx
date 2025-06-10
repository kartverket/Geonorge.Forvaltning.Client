import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useUpdateDatasetMutation } from "store/services/api";
import { Spinner } from "components";
import DatasetForm from "../DatasetNewModal/DatasetForm";
import { fromDbModel, toDbModel } from "../DatasetNewModal/mapper";
import styles from "./DatasetDefinitionsModal.module.scss";

export default function InfoModal({ dataset, onClose }) {
   const [loading, setLoading] = useState(false);
   const methods = useForm({ defaultValues: fromDbModel(dataset) });
   const { handleSubmit } = methods;
   const [updateDataset] = useUpdateDatasetMutation();

   function submit() {
      handleSubmit(async (dataset) => {
         setLoading(true);
         const payload = toDbModel(dataset);

         try {
            await updateDataset({ id: dataset.id, dataset: payload }).unwrap();
            setLoading(false);
            toast.success(`Datasettet '${dataset.name}' ble oppdatert.`);
            onClose();
         } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error(`Datasettet '${dataset.name}' kunne ikke oppdateres.`);
         }
      })();
   }

   return (
      <div className={styles.modal}>
         <heading-text>
            <h1>{dataset.Name}</h1>
         </heading-text>

         <heading-text>
            <h2 underline="true">Rediger definisjoner</h2>
         </heading-text>

         <div className={styles.body}>
            <FormProvider {...methods}>
               <DatasetForm />

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
            </FormProvider>
         </div>

         <div className={styles.buttons}>
            <gn-button>
               <button onClick={onClose}>Lukk</button>
            </gn-button>
         </div>
      </div>
   );
}
