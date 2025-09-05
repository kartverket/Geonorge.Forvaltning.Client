import axios from "axios";
import { getDatasetDefinition } from "./datasetDefinition";
import { getHeaders } from "./helpers";
import environment from "config/environment";

export async function getDataset(id) {
   const { data: metadata, error: definitionError } =
      await getDatasetDefinition(id);

   if (definitionError !== null) {
      return {
         data: null,
         error: definitionError,
      };
   }

   return await getDatasetData(metadata);
}

async function getDatasetData(metadata) {
   const table = metadata.TableName;
   const { data: objects, error } = await getData(metadata.Id);

   if (error !== null) {
      return {
         data: null,
         error,
      };
   }

   return {
      data: {
         table: table,
         definition: metadata,
         objects,
      },
      error: null,
   };
}

async function getData(id) {
   try {
      const url = `${environment.API_BASE_URL}/Object/${id}`;
      const headers = await getHeaders();
      const response = await axios.get(url, { headers });

      return {
         data: response.data,
         error: null,
      };
   } catch (error) {
      return {
         data: null,
         error,
      };
   }
}
