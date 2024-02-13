import AllowedValuesModal from './AllowedValuesModal';
import AnalysisModal from './AnalysisModal';
import ConfirmModal from './ConfirmModal';
import DeleteDatasetModal from './DeleteDatasetModal';
import InfoModal from './InfoModal';

export const modalType = {
   'ALLOWED_VALUES': 'ALLOWED_VALUES',
   'ANALYSIS': 'ANALYSIS',
   'CONFIRM': 'CONFIRM',
   'DELETE_DATASET': 'DELETE_DATASET',
   'INFO': 'INFO'
}

export const modals = {
   'ALLOWED_VALUES': AllowedValuesModal,
   'ANALYSIS': AnalysisModal,
   'CONFIRM': ConfirmModal,
   'DELETE_DATASET': DeleteDatasetModal,
   'INFO': InfoModal
};
