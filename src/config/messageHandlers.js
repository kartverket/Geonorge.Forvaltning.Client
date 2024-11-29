import store from 'store';
import { api } from 'store/services/api';
import { removeConnectedUser, setConnectedUsers } from 'store/slices/appSlice';
import { createRemoteDataObject, updateDataObject } from 'store/slices/objectSlice';

export const messageType = {
    ReceiveCursorMoved: 'ReceiveCursorMoved',
    ReceiveObjectCreated: 'ReceiveObjectCreated',
    ReceiveObjectUpdated: 'ReceiveObjectUpdated',
    ReceiveObjectsDeleted: 'ReceiveObjectsDeleted',
    ReceiveUserDisconnected: 'ReceiveUserDisconnected',
    SendCursorMoved: 'SendCursorMoved',
    SendObjectCreated: 'SendObjectCreated',
    SendObjectUpdated: 'SendObjectUpdated',
    SendObjectsDeleted: 'SendObjectsDeleted',
};

const messageHandlers = new Map();

messageHandlers.set(messageType.ReceiveCursorMoved, message => {
    store.dispatch(setConnectedUsers(message));
});

messageHandlers.set(messageType.ReceiveUserDisconnected, message => {
    store.dispatch(removeConnectedUser(message));
});

messageHandlers.set(messageType.ReceiveObjectCreated, message => {
    const { datasetId } = message;
    
    store.dispatch(createRemoteDataObject(message.object));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});

messageHandlers.set(messageType.ReceiveObjectUpdated, message => {
    const { objectId: id, datasetId, properties } = message;

    store.dispatch(updateDataObject({ id, properties }));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});

messageHandlers.set(messageType.ReceiveObjectsDeleted, message => {
    const { objectId: id, datasetId, properties } = message;

    store.dispatch(updateDataObject({ id, properties }));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});


export default messageHandlers;