import styles from './ConfirmModal.module.scss';

export default function ConfirmModal({ title, body, okText = 'OK', cancelText = 'Avbryt', onClose, callback, className = '' }) {
   function handleOk() {
      onClose();
      callback({ result: true });
   }

   function handleClose() {
      onClose();
      callback({ result: false });
   }

   return (
      <div className={`${styles.modal} ${className}`}>
         <h1>{title}</h1>

         <div className={styles.body}>
            {body}
         </div>

         <div className={styles.buttons}>
            <gn-button>
               <button onClick={handleClose}>{cancelText}</button>
            </gn-button>

            <gn-button color="danger">
               <button onClick={handleOk}>{okText}</button>
            </gn-button>
         </div>
      </div>
   );
}