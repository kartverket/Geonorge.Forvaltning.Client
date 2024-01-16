import { Outlet } from 'react-router-dom';
import AuthProvider from 'context/AuthProvider';
import ModalProvider from 'context/ModalProvider';
import styles from './App.module.scss';
import environment from 'config/environment';

export default function App() {
   return (
      <AuthProvider>
         <ModalProvider>
            <div className={styles.app}>
               <content-container>
                  <main-navigation environment={environment.ENVIRONMENT} />
                  <Outlet />
                  <geonorge-footer version={environment.BUILD_VERSION_NUMBER} />
               </content-container>
            </div>
         </ModalProvider>
      </AuthProvider>
   );
}
