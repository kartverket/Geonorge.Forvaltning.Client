import { getHeaders } from '../queries/helpers';
import axios from 'axios';
import environment from 'config/environment';

export async function addDatasetObject(payload, tableId) {
    try {
        const url = `${environment.API_BASE_URL}/object/${tableId}`;
        const headers = await getHeaders();
        const response = await axios.post(url, payload, { headers });

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

export async function addDatasetObjects(payload, tableId) {
    try {
        const url = `${environment.API_BASE_URL}/object/all/${tableId}`;
        const headers = await getHeaders();
        const response = await axios.post(url, payload, { headers });

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

export async function updateDatasetObject(payload, tableId) {
    try {
        const url = `${environment.API_BASE_URL}/object/${tableId}`;
        const headers = await getHeaders();
        const response = await axios.put(url, payload, { headers });

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

export async function deleteDatasetObjects(ids, tableId) {
    try {
        const headers = await getHeaders();
        const promises = [];

        for (const id of ids) {
            const url = `${environment.API_BASE_URL}/object/${tableId}/${id}`;
            promises.push(axios.delete(url, { headers }));
        }

        await Promise.all(promises);

        return {
            data: null,
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

export async function deleteAllDatasetObjects(tableId) {
    try {
        const url = `${environment.API_BASE_URL}/object/${tableId}`;
        const headers = await getHeaders();
        
        await axios.delete(url, { headers });

        return {
            data: null,
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
