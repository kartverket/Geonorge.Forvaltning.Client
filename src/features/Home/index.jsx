import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import RequestAuthorization from "./RequestAuthorization";
import MapProvider from "context/MapProvider";
import Panel from "features/Map/Panel";
import { MapView } from "features/Map";
import styles from "./Home.module.scss";

export default function Home() {
   const user = useSelector((state) => state.app.user);

   return user?.organization !== null ? (
      <div className="container">
         <MapProvider>
            <div className={styles.mapContainer}>
               <div className={styles.mapView}>
                  {!!user && <Panel />}
                  <MapView />
               </div>
            </div>
         </MapProvider>

         <ToastContainer />
      </div>
   ) : user !== null ? (
      <RequestAuthorization />
   ) : null;
}
