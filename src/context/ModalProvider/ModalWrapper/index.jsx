import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { hideScrollbar, showScrollbar } from './helpers';
import { modals } from 'components/Modals';
import ReactModal from 'react-modal';
import styles from './ModalWrapper.module.scss';

ReactModal.setAppElement('#root');

export default function ModalWrapper({ open, type, onClose, callback, ...props }) {
   const location = useLocation();
   const locationRef = useRef(null);

   const handleClose = useCallback(
      () => {
         onClose();
         callback({ result: false, data: null });
      },
      [callback, onClose]
   );

   useEffect(
      () => {
         if (!open) {
            locationRef.current = null;
         }
      },
      [open]
   );

   useEffect(
      () => {
         if (!open) {
            return;
         }

         if (location !== locationRef.current && locationRef.current !== null) {
            handleClose();
         } else {
            locationRef.current = location;
         }
      },
      [location, open, handleClose]
   );

   function handleAfterOpen() {
      hideScrollbar();
   }

   function handleAfterClose() {
      showScrollbar();
   }

   function renderModal() {
      const Component = modals[type];

      return Component ?
         <Component onClose={onClose} callback={callback} {...props} /> :
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