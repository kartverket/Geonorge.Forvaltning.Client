import { getAccessToken } from 'store/services/supabase/client';
import environment from 'config/environment';

export async function addDatasetObject(payload, table) {

   let error = null;
   let data = null;

   try {
      const accessToken = await getAccessToken();
      const bearer = `Bearer ${accessToken}`;

      var idDataset = table.replace("t_", "");

      const response = await fetch(environment.API_BASE_URL + '/Object/'+ idDataset, { 
         method: 'POST',
         headers: new Headers({
            'Content-type': 'application/json',
            'Authorization': bearer,
            'Apikey': environment.SUPABASE_ANON_KEY,
         }),
         body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      data = await response.json();
   }
   catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
   }

   return { data, error };
}

export async function addDatasetObjects(payload, table) {     

      let error = null;
      let data = null;
   
      try {
         const accessToken = await getAccessToken();
         const bearer = `Bearer ${accessToken}`;
   
         var idDataset = table.replace("t_", "");
   
         const response = await fetch(environment.API_BASE_URL + '/Object/all/'+ idDataset, { 
            method: 'POST',
            headers: new Headers({
               'Content-type': 'application/json',
               'Authorization': bearer,
               'Apikey': environment.SUPABASE_ANON_KEY,
            }),
            body: JSON.stringify(payload)
         });
   
         if (!response.ok) {
           throw new Error('Network response was not ok.');
         }
   
         data = await response.json();
      }
      catch (error) {
         console.error('There has been a problem with your fetch operation:', error);
      }

   return { data, error };
}

export async function updateDatasetObject(id, payload, table) {

      let error = null;
      try {
         const accessToken = await getAccessToken();
         const bearer = `Bearer ${accessToken}`;

         var idDataset = table.replace("t_", "");

         const response = await fetch(environment.API_BASE_URL + '/Object/'+ idDataset, { 
            method: 'PUT',
            headers: new Headers({
               'Content-type': 'application/json',
               'Authorization': bearer,
               'Apikey': environment.SUPABASE_ANON_KEY,
            }),
            body: JSON.stringify(payload)
         });

         if (!response.ok) {
           throw new Error('Network response was not ok.');
         }
      }
      catch (error) {
         console.error('There has been a problem with your fetch operation:', error);
      }


   return { data: null, error };
}

export async function deleteDatasetObjects(ids, table) {

   let error = null;
   try {
      const accessToken = await getAccessToken();
      const bearer = `Bearer ${accessToken}`;

      var idDataset = table.replace("t_", "");

      for (const id of ids) {
         const response = await fetch(environment.API_BASE_URL + '/Object/'+ idDataset + "/" + id, { 
            method: 'DELETE',
            headers: new Headers({
               'Content-type': 'application/json',
               'Authorization': bearer,
               'Apikey': environment.SUPABASE_ANON_KEY,
            })
         });
   
         if (!response.ok) {
           throw new Error('Network response was not ok.');
         }
      }
   }
   catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
   }

   return { data: null, error };
}

export async function deleteAllDatasetObjects(table) {

   let error = null;
   try {
      const accessToken = await getAccessToken();
      const bearer = `Bearer ${accessToken}`;

      var idDataset = table.replace("t_", "");


      const response = await fetch(environment.API_BASE_URL + '/Object/'+ idDataset, { 
         method: 'DELETE',
         headers: new Headers({
            'Content-type': 'application/json',
            'Authorization': bearer,
            'Apikey': environment.SUPABASE_ANON_KEY,
         })
      });

      if (!response.ok) {
         throw new Error('Network response was not ok.');
      }

   }
   catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
   }   

   return { data: null, error };
}
