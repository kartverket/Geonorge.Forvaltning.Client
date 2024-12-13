import supabase from 'store/services/supabase/client';
import { getDatasetDefinition } from './datasetDefinition';
import { getRowCount } from './common';
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
   const columns = metadata.ForvaltningsObjektPropertiesMetadata.filter(prop => prop.hidden === false).map(metadata => metadata.ColumnName);
   const hiddenColumns = metadata.ForvaltningsObjektPropertiesMetadata.filter(prop => prop.hidden === true).map(prop => prop.ColumnName);

   let select = `id, ${columns.join(', ')}, geometry`;

   if(hiddenColumns.length > 0) {
      select += `, ${table}_hidden (${hiddenColumns.join(', ')})`;
   }

   if (metadata.Id === environment.TAG_DATASET_ID) {
      select += ', tag'
   }

   const { data: objects, error } = await getData(table, select);

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

async function getData(table, select) {
   const { count } = await getRowCount(table);
   const queryCount = Math.ceil(count / environment.SUPABASE_MAX_ROWS);
   const promises = [];

   for (let i = 0; i < queryCount; i++) {
      promises.push(supabase
         .from(table)
         .select(select)
         .range(i * environment.SUPABASE_MAX_ROWS, i * environment.SUPABASE_MAX_ROWS + 999)
         .order('id', { ascending: false })
      );
   }

   const results = await Promise.all(promises);
   const error = results.find(result => result.error !== null)?.error;

   if (error) {
      return { data: null, error };
   }

   return { 
      data: results.flatMap(result => result.data), 
      error: null 
   };
}