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

   return await promise.unwrap()
}

export async function getDatasetDefinition({ params }) {
   if (!await signedIn()) {
      return redirect('/logg-inn');
   }
   
   const promise = store.dispatch(api.endpoints.getDatasetDefinition.initiate(params.id));
   promise.unsubscribe();

   return await promise.unwrap()
}

export async function getDataset({ params }) {
   if (!await signedIn()) {
      return redirect('/logg-inn');
   }

   const promise = store.dispatch(api.endpoints.getDataset.initiate(params.id));
   promise.unsubscribe();

   return await promise.unwrap()
}