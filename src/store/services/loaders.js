import store from "store";
import { api } from "store/services/api";

export async function getDatasetDefinitions() {
   const datasetDefinitions = await _fetch(
      store.dispatch(api.endpoints.getDatasetDefinitions.initiate())
   );

   const datasets = await Promise.all(
      datasetDefinitions.map(async (definition) => {
         if (!definition.Organization)
            return { ...definition, organizationName: null };

         const organizationName = await _fetch(
            store.dispatch(
               api.endpoints.getOrganizationName.initiate(
                  definition.Organization
               )
            )
         );

         return { ...definition, organizationName };
      })
   );

   return datasets;
}

async function _fetch(promise) {
   promise.unsubscribe();

   try {
      return await promise.unwrap();
   } catch (error) {
      return null;
   }
}
