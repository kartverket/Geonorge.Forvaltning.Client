import { Outlet } from 'react-router-dom';
import AuthProvider from 'context/AuthProvider';
import ModalProvider from 'context/ModalProvider';
import styles from './App.module.scss';

export default function App() {
   return (
      <AuthProvider>
         <ModalProvider>
            <div className={styles.app}>
               <content-container>
                  <main-navigation environment="dev" />
                  <Outlet />
                  <geonorge-footer />
               </content-container>
            </div>
         </ModalProvider>
      </AuthProvider>
   );
}
