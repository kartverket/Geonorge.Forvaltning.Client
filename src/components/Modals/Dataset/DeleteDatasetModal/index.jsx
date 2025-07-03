import { useState } from "react";
import { toast } from "react-toastify";
import { useDeleteDatasetMutation } from "store/services/api";
import { Spinner } from "components";
import styles from "./DeleteDatasetModal.module.scss";

export default function DeleteDatasetModal({ definition, onClose, callback }) {
   const [name, setName] = useState("");
   const [loading, setLoading] = useState(false);
   const [_deleteDataset] = useDeleteDatasetMutation();

   function handleClose() {
      onClose();
      callback({ result: false });
   }

   async function deleteDataset() {
      try {
         setLoading(true);
         await _deleteDataset({ id: definition.Id }).unwrap();

         toast.success(`Datasettet «${definition.Name}» ble slettet`);
         callback({ result: true });
         onClose();
      } catch (error) {
         toast.error(`Datasettet «${definition.Name}» kunne ikke slettes`);
         callback({ result: false });
         onClose();
      }
   }

   return (
      <div className={styles.modal}>
         <h1>Slett datasett</h1>

         <div className={styles.body}>
            <p>For å bekrefte, skriv «{definition.Name}» i boksen under:</p>

            <gn-input block="">
               <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
               />
            </gn-input>
         </div>

         <div className={styles.buttons}>
            <gn-button>
               <button onClick={handleClose}>Avbryt</button>
            </gn-button>

            <gn-button color="danger">
               <button
                  onClick={deleteDataset}
                  disabled={name !== definition.Name || loading}
               >
                  Slett datasett
               </button>
            </gn-button>
            {loading && <Spinner style={{ margin: "2px 0 0 12px" }} />}
         </div>
      </div>
   );
}
