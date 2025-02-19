import store from 'store';
import { api } from 'store/services/api';
import { removePointerPositions, setPointerPositions } from 'store/slices/mapSlice';
import { createDataObject, updateDataObject, deleteDataObjects, setEditedDataObjects } from 'store/slices/objectSlice';
import { getHeaders } from '../store/services/supabase/queries/helpers';
import axios from 'axios';
import environment from 'config/environment';

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
    console.log("messageHandlers created -> message", message)
    getDatasetObject(datasetId, object.id).then(({ data, error }) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log("messageHandlers created -> data", data)
        const object = data[0];
        store.dispatch(createDataObject({ datasetId, object }));
        store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
    });

});

messageHandlers.set(messageType.ReceiveObjectUpdated, message => {
    const { objectId: id, datasetId } = message;
    console.log("messageHandlers updated -> message", message)
    getDatasetObject(datasetId, id).then(({ data, error }) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log("messageHandlers updated -> data", data)
        const properties = data[0];
        store.dispatch(updateDataObject({ id, properties }));
        store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
    });
});

messageHandlers.set(messageType.ReceiveObjectsDeleted, message => {
    const { datasetId, ids } = message;
    store.dispatch(deleteDataObjects({ datasetId, ids }));
    store.dispatch(api.util.invalidateTags([{ type: 'Dataset', id: datasetId }]));
});

async function getDatasetObject(datasetId, objectId) {
    try {
        const url = `${environment.API_BASE_URL}/object/${datasetId}/${objectId}`;
        const headers = await getHeaders();
        const response = await axios.get(url, { headers });

        return {
            data: response.data,
            error: null
        };
    }
    catch (error) {
        return {
            data: null,
            error
        };
    }
}

export default messageHandlers;