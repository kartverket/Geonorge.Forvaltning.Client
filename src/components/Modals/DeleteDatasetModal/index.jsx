import { useState } from 'react';
import { useDeleteDatasetMutation } from 'store/services/api';
import { useModal } from 'context/ModalProvider';
import { modalType } from '..';
import { Spinner } from 'components';
import styles from './DeleteDatasetModal.module.scss';

export default function DeleteDatasetModal({ datasetId, datasetName, onClose, callback }) {
   const [name, setName] = useState('');
   const [loading, setLoading] = useState(false);
   const [_deleteDataset] = useDeleteDatasetMutation();
   const { showModal } = useModal();

   function handleClose() {
      onClose();
      callback({ result: false });
   }

   async function deleteDataset() {
      try {
         setLoading(true);
         await _deleteDataset({ id: datasetId }).unwrap();
         onClose();

         await showModal({
            type: modalType.INFO,
            variant: 'success',
            title: 'Datasett slettet',
            body: `Datasettet «${datasetName}» ble slettet.`
         });

         callback({ result: true });
      } catch (error) {
         console.error(error);
         onClose();

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: `Datasettet «${datasetName}» kunne ikke slettes.`
         });

         callback({ result: false });
      }
   }

   return (
      <div className={styles.modal}>
         <h1>Slett datasett</h1>

         <div className={styles.body}>
            <p>For å bekrefte, skriv «{datasetName}» i boksen under:</p>

            <gn-input block="">
               <input type="text" value={name} onChange={event => setName(event.target.value)} />
            </gn-input>
         </div>

         <div className={styles.buttons}>
            <gn-button>
               <button onClick={handleClose}>Avbryt</button>
            </gn-button>

            <gn-button color="danger">
               <button onClick={deleteDataset} disabled={name !== datasetName || loading}>Slett datasett</button>
            </gn-button>
            {
               loading && <Spinner style={{ margin: '2px 0 0 12px' }} />
            }
         </div>
      </div>
   );
}