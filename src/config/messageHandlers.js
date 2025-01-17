import store from 'store';
import { api } from 'store/services/api';
import { removePointerPositions, setPointerPositions } from 'store/slices/mapSlice';
import { createDataObject, updateDataObject, deleteDataObjects, setEditedDataObjects } from 'store/slices/objectSlice';

export const messageType = {
    ReceivePointerMoved: 'ReceivePointerMoved',
    ReceiveObjectEdited: 'ReceiveObjectEdited',
    ReceiveObjectsEdited: 'ReceiveObjectsEdited',
    ReceiveObjectCreated: 'ReceiveObjectCreated',
    ReceiveObjectUpdated: 'ReceiveObjectUpdated',
    ReceiveObjectsDeleted: 'ReceiveObjectsDeleted',
    ReceiveUserDisconnected: 'ReceiveUserDisconnected',
    SendPointerMoved: 'SendPointerMoved',
    SendObjectEdited: 'SendObjectEdited',
    SendObjectCreated: 'SendObjectCreated',
    SendObjectUpdated: 'SendObjectUpdated',
    SendObjectsDeleted: 'SendObjectsDeleted',
};

const messageHandlers = new Map();

messageHandlers.set(messageType.ReceivePointerMoved, message => {
    store.dispatch(setPointerPositions(message));
});

messageHandlers.set(messageType.ReceiveUserDisconnected, message => {
    store.dispatch(removePointerPositions(message));
});

messageHandlers.set(messageType.ReceiveObjectEdited, message => {
    store.dispatch(setEditedDataObjects([message]));
});

messageHandlers.set(messageType.ReceiveObjectsEdited, message => {
    store.dispatch(setEditedDataObjects(message));
});

messageHandlers.set(messageType.ReceiveObjectCreated, message => {
    const { datasetId, object } = message;

    store.dispatch(createDataObject({ datasetId, object }));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});

messageHandlers.set(messageType.ReceiveObjectUpdated, message => {
    const { objectId: id, datasetId, properties } = message;

    store.dispatch(updateDataObject({ id, properties }));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});

messageHandlers.set(messageType.ReceiveObjectsDeleted, message => {
    const { datasetId, ids } = message;

    store.dispatch(deleteDataObjects({ datasetId, ids }));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});

export default messageHandlers;