import { createApi } from '@reduxjs/toolkit/query/react';
import { getDatasetDefinition, getDatasetDefinitions } from './supabase/queries/datasetDefinition';
import { getDataset } from './supabase/queries/dataset';
import { addDatasetObject, addDatasetObjects, deleteAllDatasetObjects, deleteDatasetObjects, updateDatasetObject } from './supabase/mutations/dataObject';
import cacheUpdater from './cacheUpdater';
import createBaseQuery from './baseQuery';
import addCommonProperties from './helpers';
import environment from 'config/environment';

const baseQuery = createBaseQuery(environment.API_BASE_URL);

export const api = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: [
        'Dataset',
        'DatasetDefinition',
        'DatasetDefinitions'
    ],
    endpoints: builder => ({
        getDatasetDefinitions: builder.query({
            queryFn: async id => {
                const { data, error } = await getDatasetDefinitions(id);

                if (error !== null) {
                    throw error;
                }

                return { data, error };
            },
            providesTags: ['DatasetDefinitions']
        }),
        getDatasetDefinition: builder.query({
            queryFn: async id => {
                const { data, error } = await getDatasetDefinition(id);

                if (error !== null) {
                    throw error;
                }

                return { data, error };
            },
            providesTags: (result, error, arg) => [{ type: 'DatasetDefinition', id: arg }],
        }),
        getDataset: builder.query({
            queryFn: async id => {
                const { data, error } = await getDataset(id);

                if (error !== null) {
                    throw error;
                }

                return { data, error };
            },
            providesTags: (result, error, arg) => [{ type: 'Dataset', id: arg }],
        }),
        getOrganizationName: builder.query({
            query: orgName => ({
                url: `organizationSearch/${orgName}`,
                responseHandler: 'text'
            })
        }),
        getAnalysableDatasetIds: builder.query({
            query: datasetId => `analysis/${datasetId}`
        }),
        addDataset: builder.mutation({
            query: dataset => ({
                method: 'POST',
                body: dataset,
                url: 'admin/object'
            }),
            invalidatesTags: ['DatasetDefinitions']
        }),
        updateDataset: builder.mutation({
            query: ({ id, dataset }) => ({
                method: 'PUT',
                body: dataset,
                url: `admin/object/${id}`
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Dataset', id: arg.id },
                { type: 'DatasetDefinition', id: arg.id },
                'DatasetDefinitions'
            ]
        }),
        updateTag: builder.mutation({
            query: ({ datasetId, id, tag }) => ({
                method: 'PUT',
                url: `admin/tag/${datasetId}/${id}/${tag}`,
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Dataset', id: arg.datasetId }]
        }),
        deleteDataset: builder.mutation({
            query: ({ id }) => ({
                method: 'DELETE',
                url: `admin/object/${id}`
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    cacheUpdater.deleteDataset(dispatch, args);
                } catch (error) {
                    console.error(error);
                }
            }
        }),
        addDatasetObject: builder.mutation({
            queryFn: async ({ payload, tableId, ownerOrg, definition }) => {
                addCommonProperties(payload, ownerOrg, definition);

                const { data, error } = await addDatasetObject(payload, tableId);

                if (error) {
                    throw error;
                }

                return { data, error };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    cacheUpdater.addDatasetObject(dispatch, args, data);
                } catch (error) {
                    console.error(error);
                }
            }
        }),
        addDatasetObjects: builder.mutation({
            queryFn: async ({ payload, tableId }) => {
                const { data, error } = await addDatasetObjects(payload, tableId);

                if (error) {
                    throw error;
                }

                return { data, error };
            },
            invalidatesTags: (result, error, arg) => [{ type: 'Dataset', id: arg.tableId }]
        }),
        updateDatasetObject: builder.mutation({
            queryFn: async ({ payload, tableId, ownerOrg, definition }) => {
                addCommonProperties(payload, ownerOrg, definition);

                const { data, error } = await updateDatasetObject(payload, tableId);

                if (error) {
                    throw error;
                }

                return { data, error };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    cacheUpdater.updateDatasetObject(dispatch, args);
                } catch (error) {
                    console.error(error);
                }
            }
        }),
        deleteDatasetObjects: builder.mutation({
            queryFn: async ({ ids, tableId }) => {
                const { data, error } = await deleteDatasetObjects(ids, tableId);

                if (error) {
                    throw error;
                }

                return { data, error };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    cacheUpdater.deleteDatasetObjects(dispatch, args);
                } catch (error) {
                    console.error(error);
                }
            }
        }),
        deleteAllDatasetObjects: builder.mutation({
            queryFn: async ({ tableId }) => {
                const { data, error } = await deleteAllDatasetObjects(tableId);

                if (error) {
                    throw error;
                }

                return { data, error };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    cacheUpdater.deleteAllDatasetObjects(dispatch, args);
                } catch (error) {
                    console.error(error);
                }
            }
        }),
        setDatasetAccess: builder.mutation({
            query: accessRights => ({
                method: 'POST',
                body: accessRights,
                url: 'admin/access'
            }),
        }),
        requestAuthorization: builder.mutation({
            query: () => ({
                method: 'POST',
                url: 'admin/authorize-request'
            })
        }),
        analayze: builder.mutation({
            query: ({ payload }) => ({
                method: 'POST',
                body: payload,
                url: 'analysis'
            }),
        }),
    })
});

export const {
    useGetDatasetDefinitionsQuery,
    useGetDatasetDefinitionQuery,
    useGetDatasetQuery,
    useGetAnalysableDatasetIdsQuery,
    useLazyGetOrganizationNameQuery,
    useAddDatasetMutation,
    useUpdateDatasetMutation,
    useUpdateTagMutation,
    useDeleteDatasetMutation,
    useAddDatasetObjectMutation,
    useAddDatasetObjectsMutation,
    useUpdateDatasetObjectMutation,
    useDeleteDatasetObjectsMutation,
    useDeleteAllDatasetObjectsMutation,
    useSetDatasetAccessMutation,
    useRequestAuthorizationMutation,
    useAnalayzeMutation
} = api;