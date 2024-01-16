import { inPlaceSort } from 'fast-sort';
import supabase from 'store/services/supabase/client';

export async function getDatasetDefinitions() {
   return await supabase
      .from('ForvaltningsObjektMetadata')
      .select('Id, Name, Description, Organization');
}

export async function getDatasetDefinition(id) {
   const definition = await supabase
      .from('ForvaltningsObjektMetadata')
      .select('Id, Organization, Name, Description, TableName, IsOpenData, srid, Contributors, ForvaltningsObjektPropertiesMetadata (Id, Name, DataType, ColumnName, AllowedValues, AccessByProperties (Id, Value, Contributors))')
      .eq('Id', id)
      .single();

   inPlaceSort(definition.data.ForvaltningsObjektPropertiesMetadata).by(metadata => metadata.ColumnName);

   return definition;
}