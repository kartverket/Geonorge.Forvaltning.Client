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

      //todo read hidden columns from metadata
      let payloadHidden = {"c_3" : payload["c_3"]};
      delete payload['c_3'];

      payload['contributor_org'] = ['914994780']; // todo why problem double [[ sometimes ?

      const { error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)

      await supabase // todo handle error
      .from(table + '_hidden')
      .update(payloadHidden)
      .eq('id_row', id)


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
