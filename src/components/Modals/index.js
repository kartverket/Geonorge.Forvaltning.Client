import AllowedValuesModal from "./AllowedValuesModal";
import AnalysisModal from "./AnalysisModal";
import ConfirmModal from "./ConfirmModal";
import DatasetAccessControlModal from "./Dataset/DatasetAccessControlModal";
import DatasetDefinitionsModal from "./Dataset/DatasetDefinitionsModal";
import DatasetImportGeoJsonModal from "./Dataset/DatasetImportGeoJsonModal";
import DatasetNewModal from "./Dataset/DatasetNewModal";
import DeleteDatasetModal from "./Dataset/DeleteDatasetModal";
import InfoModal from "./InfoModal";

export const modalType = {
   ALLOWED_VALUES: "ALLOWED_VALUES",
   ANALYSIS: "ANALYSIS",
   CONFIRM: "CONFIRM",
   DATASET_ACCESS_CONTROL: "DATASET_ACCESS_CONTROL",
   DATASET_DEFINITIONS: "DATASET_DEFINITIONS",
   DATASET_IMPORT_GEOJSON: "DATASET_IMPORT_GEOJSON",
   DATASET_NEW: "DATASET_NEW",
   DELETE_DATASET: "DELETE_DATASET",
   INFO: "INFO",
};

export const modals = {
   ALLOWED_VALUES: AllowedValuesModal,
   ANALYSIS: AnalysisModal,
   CONFIRM: ConfirmModal,
   DATASET_ACCESS_CONTROL: DatasetAccessControlModal,
   DATASET_DEFINITIONS: DatasetDefinitionsModal,
   DATASET_IMPORT_GEOJSON: DatasetImportGeoJsonModal,
   DATASET_NEW: DatasetNewModal,
   DELETE_DATASET: DeleteDatasetModal,
   INFO: InfoModal,
};
