import { useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import RequestAuthorization from "./RequestAuthorization";
import { useDataset } from "context/DatasetProvider";
import MapProvider from "context/MapProvider";
import { AnalysisResult, FeatureInfo } from "features";
import DatasetTable from "features/Dataset/DatasetTable";
import {
   FeatureContextMenu,
   MapContextMenu,
   MapView,
   PlaceSearch,
} from "features/Map";
import SidePanel from "features/Map/SidePanel";
import styles from "./Home.module.scss";

export default function Home() {
   const [tableExpanded, setTableExpanded] = useState(false);
   const user = useSelector((state) => state.app.user);
   const fullscreen = useSelector((state) => state.app.fullscreen);

   const { activeDatasetId, datasets } = useDataset();

   const activeDataset = datasets[activeDatasetId];

   return user?.organization !== null ? (
      <div className={`${fullscreen ? styles.fullscreen : ""}`}>
         <MapProvider>
            <div className={styles.container}>
               {activeDataset && <FeatureInfo />}

               <div className={styles.content}>
                  <div className={styles.placeSearch}>
                     {activeDataset && <PlaceSearch />}
                  </div>

                  {activeDataset && (
                     <div className={styles.activeDatasetLabel}>
                        Aktivt lag: {activeDataset.definition.Name}
                     </div>
                  )}

                  <MapView
                     fullscreen={fullscreen}
                     tableExpanded={tableExpanded}
                  />

                  {activeDataset && <MapContextMenu />}

                  <FeatureContextMenu />

                  {!!user && <SidePanel />}

                  {/* <Cursors /> */}
               </div>

               <AnalysisResult />
            </div>

            <div
               className={`${styles.tableContainer} ${
                  tableExpanded ? styles.expanded : ""
               } ${!activeDataset ? styles.disabled : ""}`}
            >
               <div className={styles.expandTable}>
                  <gn-button>
                     <button onClick={() => setTableExpanded(!tableExpanded)}>
                        {!tableExpanded ? "Åpne" : "Lukk"} tabellvisning
                     </button>
                  </gn-button>
               </div>

               <div className={styles.table}>
                  {activeDataset && <DatasetTable />}
               </div>
            </div>
         </MapProvider>

         <ToastContainer />
      </div>
   ) : user !== null ? (
      <RequestAuthorization />
   ) : null;
}
