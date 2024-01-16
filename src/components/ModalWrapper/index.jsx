import ReactModal from 'react-modal';
import { hideScrollbar, showScrollbar } from './helpers';
import { modals } from 'components/Modals';
import styles from './Modal.module.scss';

ReactModal.setAppElement('#root');

export default function Modal({ open, type, ...props }) {
   function handleAfterOpen() {
      hideScrollbar();
   }

   function handleAfterClose() {
      showScrollbar();
   }

   function handleClose() {
      props.onClose();
      props.callback({ result: false, data: null });
   }

   function renderModal() {
      const Component = modals[type];

      return Component ?
         <Component {...props} /> :
         null;
   }

   return (
      <ReactModal
         isOpen={open}
         onAfterOpen={handleAfterOpen}
         onAfterClose={handleAfterClose}
         overlayClassName={styles.overlay}
         className={styles.content}
      >
         <div className={styles.modal}>
            <button onClick={handleClose} className={styles.closeButton}></button>
            {renderModal()}
         </div>
      </ReactModal>
   );
}