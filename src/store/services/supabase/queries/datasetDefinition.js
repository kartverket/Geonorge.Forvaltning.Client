import { inPlaceSort } from 'fast-sort';
import supabase from 'store/services/supabase/client';

export async function getDatasetDefinitions() {
   return await supabase
      .from('ForvaltningsObjektMetadata')
      .select('Id, Name, Description, Organization, AttachedForvaltningObjektMetadataIds, ForvaltningsObjektPropertiesMetadata (Id, Name, DataType, ColumnName, AllowedValues, AccessByProperties (Id, Value, Contributors))')
      .order('Name');
}

export async function getDatasetDefinition(id) {
   const { data, error } = await supabase
      .from('ForvaltningsObjektMetadata')
      .select('Id, Organization, Name, Description, TableName, IsOpenData, Contributors, Viewers, AttachedForvaltningObjektMetadataIds, ForvaltningsObjektPropertiesMetadata (Id, Name, DataType, ColumnName, AllowedValues, Hidden, AccessByProperties (Id, Value, Contributors))')
      .eq('Id', id)
      .single();

   if (error !== null) {
      return { data: null, error };
   }

   inPlaceSort(data.ForvaltningsObjektPropertiesMetadata).by(metadata => metadata.ColumnName);

   return { data, error };
}