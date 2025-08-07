import {
   createContext,
   useCallback,
   useContext,
   useLayoutEffect,
   useState,
} from "react";
import ModalWrapper from "./ModalWrapper";
import { lockBodyScroll, unlockBodyScroll } from "./helpers";

export default function ModalProvider({ children }) {
   const [modalStack, setModalStack] = useState([]);

   const showModal = useCallback((props) => {
      return new Promise((resolve) => {
         setModalStack((stack) => [
            ...stack,
            { props: { ...props, open: true }, callback: resolve },
         ]);
      });
   }, []);

   const handleClose = useCallback(() => {
      setModalStack((stack) => (stack.length > 0 ? stack.slice(0, -1) : stack));
   }, []);

   useLayoutEffect(() => {
      if (modalStack.length === 1) lockBodyScroll();
      else if (modalStack.length === 0) unlockBodyScroll();
   }, [modalStack.length]);

   return (
      <ModalContext.Provider value={{ showModal, closeModal: handleClose }}>
         {children}

         {modalStack.map((entry, index) => (
            <ModalWrapper
               key={index}
               open={entry.props.open}
               type={entry.props.type}
               onClose={handleClose}
               callback={entry.callback}
               {...entry.props}
            />
         ))}
      </ModalContext.Provider>
   );
}

export const ModalContext = createContext({});
export const useModal = () => useContext(ModalContext);
