import AllowedValuesModal from './AllowedValuesModal';
import ConfirmModal from './ConfirmModal';
import DeleteDatasetModal from './DeleteDatasetModal';
import InfoModal from './InfoModal';

export const modalType = {
   'ALLOWED_VALUES': 'ALLOWED_VALUES',
   'CONFIRM': 'CONFIRM',
   'DELETE_DATASET': 'DELETE_DATASET',
   'INFO': 'INFO'
}

export const modals = {
   'ALLOWED_VALUES': AllowedValuesModal,
   'CONFIRM': ConfirmModal,
   'DELETE_DATASET': DeleteDatasetModal,
   'INFO': InfoModal
};
