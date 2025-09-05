import { createClient } from "@supabase/supabase-js";
import environment from "config/environment";

const supabase = createClient(
   environment.SUPABASE_URL,
   environment.SUPABASE_ANON_KEY
);

export default supabase;

export async function signedIn() {
   const response = await supabase.auth.getSession();
   return response !== null && response.data.session !== null;
}

export async function getAccessToken() {
   const response = await supabase.auth.getSession();

   return response !== null && response.data.session !== null
      ? response.data.session.access_token
      : null;
}
