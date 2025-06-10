import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAddDatasetMutation } from "store/services/api";
import { getDefaultValues, toDbModel } from "./mapper";
import DatasetForm from "./DatasetForm";
import { Spinner } from "components";
import styles from "./DatasetNewModal.module.scss";

export default function DatasetNewModal({ onClose }) {
   const [datasetName, setDatasetName] = useState("");
   const methods = useForm({ defaultValues: getDefaultValues() });
   const { handleSubmit, reset } = methods;
   const [loading, setLoading] = useState(false);
   const [addDataset] = useAddDatasetMutation();

   function submit() {
      handleSubmit(async (dataset) => {
         setLoading(true);
         const payload = toDbModel(dataset);

         try {
            await addDataset(payload).unwrap();
            setLoading(false);
            reset(getDefaultValues());
            toast.success(`Datasettet '${dataset.name}' ble opprettet.`);
            onClose();
         } catch (error) {
            setLoading(false);
            toast.error(`Datasettet '${dataset.name}' kunne ikke opprettes.`);
            onClose();
         }
      })();
   }

   return (
      <div className={styles.modal}>
         <heading-text>
            <h1>{datasetName ? datasetName : "Nytt datasett"}</h1>
         </heading-text>

         <heading-text>
            <h2 underline="true">Legg til datasett</h2>
         </heading-text>

         <div className={styles.body}>
            <FormProvider {...methods}>
               <DatasetForm setDatasetName={setDatasetName} />

               <div className={styles.submit}>
                  <gn-button>
                     <button onClick={submit} disabled={loading}>
                        Legg til datasett
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
