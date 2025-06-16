import { Menu, MenuItem, MenuDivider } from "@szhsin/react-menu";
import { useModal } from "context/ModalProvider";
import { modalType } from "components/Modals";
// import { useGetDatasetQuery } from "store/services/api";
import { getDatasetDefinition } from "store/services/supabase/queries/datasetDefinition";
import { toGeoJson } from "features/AnalysisResult/exportGeoJson";
import styles from "./AdminMenu.module.scss";

export default function AdminMenu({ datasetId }) {
   const { showModal } = useModal();

   const getDataset = async () => {
      const { data: dataset, error } = await getDatasetDefinition(datasetId);

      if (error) {
         await showModal({
            type: modalType.INFO,
            variant: "error",
            title: "Feil",
            body: "Kunne ikke hente datasettdefinisjon.",
         });
         return null;
      }

      return dataset;
   };

   function exportToGeoJson() {
      const dataset = getDataset();
      toGeoJson(dataset);
   }

   const openModal = async (type) => {
      const dataset = await getDataset();

      if (type === modalType.DELETE_DATASET) {
         const { result: confirmed } = await showModal({
            type: modalType.CONFIRM,
            title: "Slett datasett",
            body: `Er du sikker på at du vil slette datasettet «${dataset.Name}»? Handlingen kan ikke angres.`,
            okText: "Slett",
            className: styles.confirmDeleteModal,
         });

         if (!confirmed) return;
      }

      await showModal({
         type,
         dataset,
      });
   };

   return (
      <Menu
         portal
         menuButton={
            <button
               className={styles.menu}
               title="Administrer datasett"
            ></button>
         }
         align="start"
         direction="right"
         arrow={true}
         viewScroll="close"
         position="initial"
         className={styles.adminMenu}
      >
         <MenuItem onClick={() => openModal(modalType.DATASET_DEFINITIONS)}>
            <span className={styles.definitions}>Definisjoner</span>
         </MenuItem>

         <MenuItem onClick={() => openModal(modalType.DATASET_ACCESS_CONTROL)}>
            <span className={styles.accessControl}>Tilganger</span>
         </MenuItem>

         <MenuItem onClick={() => openModal(modalType.DATASET_IMPORT_GEOJSON)}>
            <span className={styles.importData}>Importér GeoJSON</span>
         </MenuItem>

         <MenuItem onClick={exportToGeoJson}>
            <span className={styles.exportData}>Eksportér GeoJSON</span>
         </MenuItem>

         <MenuDivider />

         <MenuItem onClick={() => openModal(modalType.DELETE_DATASET)}>
            <span className={styles.deleteDataset}>Slett datasett...</span>
         </MenuItem>
      </Menu>
   );
}
