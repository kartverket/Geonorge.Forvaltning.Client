import { Menu, MenuItem, MenuDivider } from "@szhsin/react-menu";
import { toast } from "react-toastify";
import { useModal } from "context/ModalProvider";
import { modalType } from "components/Modals";
import { toGeoJson } from "features/Dataset/export";
import { getDataset } from "store/services/supabase/queries/dataset";
import { getDatasetDefinition } from "store/services/supabase/queries/datasetDefinition";
import styles from "./AdminMenu.module.scss";

export default function AdminMenu({ datasetId }) {
   const { showModal } = useModal();

   const fetchDataset = async () => {
      const { data: dataset, error } = await getDataset(datasetId);

      if (error) {
         toast.error("Kunne ikke hente datasettet.", { position: "top-left" });
         return null;
      }

      return dataset;
   };

   const fetchDefinition = async () => {
      const { data: definition, error } = await getDatasetDefinition(datasetId);

      if (error) {
         toast.error("Kunne ikke hente datasettdefinisjonen.", {
            position: "top-left",
         });
         return null;
      }

      return definition;
   };

   async function exportToGeoJson() {
      const dataset = await fetchDataset();
      toGeoJson(dataset);
   }

   const openModal = async (type) => {
      const definition = await fetchDefinition();

      if (type === modalType.DELETE_DATASET) {
         const { result: confirmed } = await showModal({
            type: modalType.CONFIRM,
            title: "Slett datasett",
            body: `Er du sikker på at du vil slette datasettet «${definition.Name}»? Handlingen kan ikke angres.`,
            okText: "Slett",
            className: styles.confirmDeleteModal,
         });

         if (!confirmed) return;
      }

      await showModal({
         type,
         definition,
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
