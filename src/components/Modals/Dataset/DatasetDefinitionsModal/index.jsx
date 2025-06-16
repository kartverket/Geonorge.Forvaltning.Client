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

         try {
            const payload = toDbModel(dataset);
            await updateDataset({ id: dataset.id, dataset: payload }).unwrap();
            setLoading(false);
            toast.success(`${dataset.name} ble oppdatert`);
            onClose();
         } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error(`${dataset.name} kunne ikke oppdateres`);
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
