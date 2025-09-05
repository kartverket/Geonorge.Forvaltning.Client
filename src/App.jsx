import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import AuthProvider from "context/AuthProvider";
import ModalProvider from "context/ModalProvider";
import environment from "config/environment";
import SignalRProvider from "context/SignalRProvider";
import messageHandlers from "config/messageHandlers";
import { MainNavigationContainer } from "components";
import styles from "./App.module.scss";

export default function App() {
   const fullscreen = useSelector((state) => state.app.fullscreen);

   useEffect(() => {
      if (fullscreen) {
         document.body.classList.add("fullscreen");
      } else {
         document.body.classList.remove("fullscreen");
      }
   }, [fullscreen]);

   return (
      <AuthProvider>
         <SignalRProvider messageHandlers={messageHandlers}>
            <ModalProvider>
               <div className={styles.app}>
                  <content-container>
                     <MainNavigationContainer />
                     <Outlet />
                     <geonorge-footer
                        version={environment.BUILD_VERSION_NUMBER}
                     />
                  </content-container>
               </div>
            </ModalProvider>
         </SignalRProvider>
      </AuthProvider>
   );
}
