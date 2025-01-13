import supabase from 'store/services/supabase/client';

export async function addDatasetObject(payload, table) {

   const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();

   return { data, error };
}

export async function addDatasetObjects(payload, table) {     
   const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select();

   return { data, error };
}

export async function updateDatasetObject(id, payload, table) {

      const { error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)

   return { data: null, error };
}

export async function deleteDatasetObjects(ids, table) {
   const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids);

   return { data: null, error };
}

export async function deleteAllDatasetObjects(table) {
   const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', 0);

   return { data: null, error };
}
