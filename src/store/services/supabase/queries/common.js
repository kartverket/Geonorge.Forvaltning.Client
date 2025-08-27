import supabase from "store/services/supabase/client";

export async function getRowCount(table) {
   return await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
}
