
import { useState, useCallback, useContext, createContext } from 'react';
import ModalWrapper from 'components/ModalWrapper';

export default function ModalProvider({ children }) {
   const [modalParams, setModalParams] = useState({});

   const showModal = useCallback(
      props => {
         return new Promise(resolve => {
            setModalParams({ ...props, open: true, callback: resolve });
         });
      },
      []
   );

   function handleClose() {
      setModalParams({});
   }

   return (
      <ModalContext.Provider value={{ showModal }}>
         {children}
         <ModalWrapper {...modalParams} onClose={handleClose} />
      </ModalContext.Provider>
   );
}

export const ModalContext = createContext({});
export const useModal = () => useContext(ModalContext);