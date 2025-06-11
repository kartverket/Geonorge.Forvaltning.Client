import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useSelector } from "react-redux";
import { useModal } from "context/ModalProvider";
import { modalType } from "components/Modals";
import AdminMenu from "./AdminMenu";
import styles from "./Panel.module.scss";

export default function Panel() {
   const datasets = useLoaderData();
   const [expanded, setExpanded] = useState(true);
   const [ownedDatasets, setOwnedDatasets] = useState([]);
   const [contributorDatasets, setContributorDatasets] = useState([]);
   const [viewerDatasets, setViewerDatasets] = useState([]);
   const [activeDatasetId, setActiveDatasetId] = useState(null);

   const user = useSelector((state) => state.app.user);

   const { showModal } = useModal();

   useEffect(() => {
      if (!datasets || !user) return;

      setOwnedDatasets(
         datasets.filter(
            (dataset) => dataset.Organization === user?.organization
         )
      );

      setContributorDatasets(
         datasets.filter((dataset) =>
            dataset.Contributors?.includes(user?.organization)
         )
      );

      setViewerDatasets(
         datasets.filter((dataset) =>
            dataset.Viewers?.includes(user?.organization)
         )
      );
   }, [datasets, user]);

   const openAddDatasetModal = async () => {
      await showModal({
         type: modalType.DATASET_NEW,
      });
   };

   const createTable = (datasets) => {
      return (
         <gn-table hoverable="">
            <table className={styles.table}>
               <tbody>
                  {datasets.map((dataset) => (
                     <tr key={dataset.Id}>
                        <td>
                           <gn-button>
                              <button
                                 className={`${
                                    activeDatasetId === dataset.Id
                                       ? styles.eyeButton
                                       : styles.eyeClosedButton
                                 }`}
                                 onClick={() =>
                                    setActiveDatasetId(
                                       activeDatasetId != dataset.Id
                                          ? dataset.Id
                                          : 0
                                    )
                                 }
                              />
                           </gn-button>
                        </td>

                        <td className={styles.name}>{dataset.Name}</td>

                        <td>
                           {dataset.Organization === user?.organization && (
                              <AdminMenu datasetId={dataset.Id} />
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </gn-table>
      );
   };

   return (
      <div className={styles.container}>
         <div className={`${styles.panel} ${expanded ? styles.expanded : ""}`}>
            <div className={styles.content}>
               <div className={styles.accordionContainer}>
                  <gn-accordion title="Eier">
                     {createTable(ownedDatasets)}
                  </gn-accordion>
                  <gn-accordion title="Bidragsyter">
                     {createTable(contributorDatasets)}
                  </gn-accordion>
                  <gn-accordion title="Innsyn">
                     {createTable(viewerDatasets)}
                  </gn-accordion>
               </div>

               <gn-button>
                  <button
                     className={styles.addButton}
                     onClick={openAddDatasetModal}
                  />
               </gn-button>
            </div>

            <div className={styles.tab} onClick={() => setExpanded(!expanded)}>
               <span
                  className={`${styles.chevron} ${
                     expanded ? styles.chevronLeft : styles.chevronRight
                  }`}
               />
               <body-text>
                  <p className={styles.text}>Kartlag</p>
               </body-text>
               <span className={styles.icon} />
            </div>
         </div>
      </div>
   );
}
