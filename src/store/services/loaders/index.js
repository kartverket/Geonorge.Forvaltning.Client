import store from 'store';
import { api } from 'store/services/api';
import { redirect } from 'react-router-dom';
import { signedIn } from '../supabase/client';

export async function getDatasetDefinitions() {
   if (!await signedIn()) {
      return redirect('/logg-inn');
   }

   const promise = store.dispatch(api.endpoints.getDatasetDefinitions.initiate());
   promise.unsubscribe();

   const response = await promise.unwrap();
   const definitions = await setOrganizationNames(response);

   return definitions;
}

export async function getDatasetDefinition({ params }) {
   if (!await signedIn()) {
      return redirect('/logg-inn');
   }

   const promise = store.dispatch(api.endpoints.getDatasetDefinition.initiate(params.id));
   promise.unsubscribe();

   try {
      return await promise.unwrap();     
   } catch (error) {
      return redirect('/');
   }
}

export async function getDataset({ params }) {
   if (!await signedIn()) {
      return redirect('/logg-inn');
   }

   const promise = store.dispatch(api.endpoints.getDataset.initiate(params.id));
   promise.unsubscribe();

   try {
      return await promise.unwrap();     
   } catch (error) {
      return redirect('/');
   }
}

export async function getOrganizationName(orgNo) {
   const promise = store.dispatch(api.endpoints.getOrganizationName.initiate(orgNo));
   promise.unsubscribe();

   return await promise.unwrap();
}

async function setOrganizationNames(definitions) {
   const newDefinitions = [];

   for (let i = 0; i < definitions.length; i++) {
      const definition = definitions[i];

      const newDefinition = { 
         ...definition, 
         organizationName: definition.Organization !== null ? 
            await getOrganizationName(definition.Organization) :
            null
      };

      newDefinitions.push(newDefinition);
   }

   return newDefinitions;
}