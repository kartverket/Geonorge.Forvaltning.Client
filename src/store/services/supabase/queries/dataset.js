import { getAccessToken } from 'store/services/supabase/client';
import { getDatasetDefinition } from './datasetDefinition';
import environment from 'config/environment';

export async function getDataset(id) {
   const { data: metadata, error: definitionError } = await getDatasetDefinition(id);

   if (definitionError !== null) {
      return { data: null, error: definitionError };
   }

   return await getDatasetData(metadata);
}

async function getDatasetData(metadata) {

   const table = metadata.TableName;

   const { data: objects, error } = await getData(metadata.Id);

   if (error !== null) {
      return { data: null, error };
   }

   return {
      data: {
         table: table,
         definition: metadata,
         objects
      },
      error: null
   };
}

async function getData(id) {

   const promises = [];
      try {

         const accessToken = await getAccessToken();
         const bearer = `Bearer ${accessToken}`;

         const response = await fetch(environment.API_BASE_URL + '/Object/'+ id, { 
            headers: new Headers({
               'Content-type': 'application/json',
               'Authorization': bearer,
               'Apikey': environment.SUPABASE_ANON_KEY,
            })}
         );
         if (!response.ok) {
           throw new Error('Network response was not ok.');
         }
         promises.push(await response.json());
      }
      catch (error) {
         console.error('There has been a problem with your fetch operation:', error);
      }

   const results = await Promise.all(promises);

   const error = results.find(result => result.error !== null)?.error;

   if (error) {
      return { data: null, error };
   }

   return { 
      data: results.flatMap(result => result), 
      error: null 
   };
}