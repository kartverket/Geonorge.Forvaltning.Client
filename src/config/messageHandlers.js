import store from 'store';
import { api } from 'store/services/api';
import { setConnectedUsers } from 'store/slices/appSlice';
import { updateDataObject } from 'store/slices/objectSlice';


export const messageType = {
    ReceiveMessage: 'ReceiveMessage',
    ReceiveObjectUpdated: 'ReceiveObjectUpdated',
    SendMessage: 'SendMessage',
    SendObjectUpdated: 'SendObjectUpdated'
};

const messageHandlers = new Map();

messageHandlers.set(messageType.ReceiveMessage, message => {
    store.dispatch(setConnectedUsers(message));
});

messageHandlers.set(messageType.ReceiveObjectUpdated, message => {
    const { objectId: id, datasetId, properties } = message;

    store.dispatch(updateDataObject({ id, properties }));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});

export default messageHandlers;