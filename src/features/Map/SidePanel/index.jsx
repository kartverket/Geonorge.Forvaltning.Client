import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useModal } from "context/ModalProvider";
import { modalType } from "components/Modals";
import { useDataset } from "context/DatasetProvider";
import { Spinner } from "components";
import AdminMenu from "./AdminMenu";
import styles from "./SidePanel.module.scss";

export default function SidePanel() {
   const [expanded, setExpanded] = useState(true);

   const user = useSelector((state) => state.app.user);

   const { showModal } = useModal();
   const {
      datasetDefinitions,
      visibleDatasetIds,
      toggleVisibleDataset,
      toggleActiveDataset,
      activeDatasetId,
      loadingDatasetIds,
   } = useDataset();

   const {
      ownedDatasetDefinitions,
      contributorDatasetDefinitions,
      viewerDatasetDefinitions,
   } = useMemo(() => {
      if (!datasetDefinitions || !user) {
         return {
            ownedDatasetDefinitions: [],
            contributorDatasetDefinitions: [],
            viewerDatasetDefinitions: [],
         };
      }

      return {
         ownedDatasetDefinitions: datasetDefinitions.filter(
            (dataset) => dataset.Organization === user.organization
         ),
         contributorDatasetDefinitions: datasetDefinitions.filter(
            (dataset) =>
               dataset.Organization !== user.organization &&
               dataset.Contributors?.includes(user.organization)
         ),
         viewerDatasetDefinitions: datasetDefinitions.filter(
            (dataset) =>
               dataset.Organization !== user.organization &&
               !dataset.Contributors?.includes(user.organization) &&
               dataset.Viewers?.includes(user.organization)
         ),
      };
   }, [datasetDefinitions, user]);

   const openAddDatasetModal = async () => {
      await showModal({
         type: modalType.DATASET_NEW,
      });
   };

   const createTable = (datasetDefinitions) => {
      return (
         <table className={styles.table}>
            <tbody>
               {datasetDefinitions.map((dataset) => (
                  <tr key={dataset.Id} className={styles.row}>
                     <td className={styles.eyeButtonCell}>
                        <button
                           className={`${
                              visibleDatasetIds.includes(dataset.Id)
                                 ? styles.eyeButton
                                 : styles.eyeClosedButton
                           }`}
                           title={
                              visibleDatasetIds.includes(dataset.Id)
                                 ? "Skjul kartlag"
                                 : "Vis kartlag"
                           }
                           onClick={() => {
                              toggleVisibleDataset(dataset.Id);
                           }}
                        />
                     </td>

                     <td
                        className={`${styles.nameCell} ${
                           activeDatasetId === dataset.Id
                              ? styles.activeDataset
                              : ""
                        }`}
                        title={
                           activeDatasetId !== dataset.Id
                              ? "Sett som aktivt kartlag"
                              : ""
                        }
                        onClick={() => {
                           toggleActiveDataset(dataset.Id);
                        }}
                     >
                        {dataset.Name}
                        {loadingDatasetIds[dataset.Id] && <Spinner />}
                     </td>

                     <td className={styles.menuCell}>
                        {dataset.Organization === user?.organization && (
                           <AdminMenu datasetId={dataset.Id} />
                        )}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      );
   };

   return (
      <div
         className={`${styles.container} ${!expanded ? styles.collapsed : ""}`}
      >
         <div className={`${styles.panel} ${expanded ? styles.expanded : ""}`}>
            <div
               className={`${styles.content} ${
                  expanded ? styles.expanded : ""
               }`}
            >
               <div className={styles.detailsContainer}>
                  {ownedDatasetDefinitions.length > 0 && (
                     <details className={styles.details}>
                        <summary>
                           <heading-text>
                              <h5>Eier</h5>
                           </heading-text>
                        </summary>
                        {createTable(ownedDatasetDefinitions)}
                     </details>
                  )}

                  {contributorDatasetDefinitions.length > 0 && (
                     <details className={styles.details}>
                        <summary>
                           <heading-text>
                              <h5>Bidragsyter</h5>
                           </heading-text>
                        </summary>
                        {createTable(contributorDatasetDefinitions)}
                     </details>
                  )}

                  {viewerDatasetDefinitions.length > 0 && (
                     <details className={styles.details}>
                        <summary>
                           <heading-text>
                              <h5>Innsyn</h5>
                           </heading-text>
                        </summary>
                        {createTable(viewerDatasetDefinitions)}
                     </details>
                  )}
               </div>

               <div className={styles.addButton}>
                  <gn-button>
                     <button onClick={openAddDatasetModal}>
                        Opprett datasett
                     </button>
                  </gn-button>
               </div>
            </div>

            <div className={styles.tab} onClick={() => setExpanded(!expanded)}>
               <span
                  className={`${styles.chevron} ${
                     expanded ? styles.chevronLeft : styles.chevronRight
                  }`}
               />

               <h5 className={styles.text}>Kartlag</h5>

               <span
                  className={`${styles.chevron} ${
                     expanded ? styles.chevronLeft : styles.chevronRight
                  }`}
               />
            </div>
         </div>
      </div>
   );
}
