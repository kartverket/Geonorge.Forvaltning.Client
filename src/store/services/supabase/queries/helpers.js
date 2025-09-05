import { getAccessToken } from "../client";
import environment from "config/environment";

export async function getHeaders() {
   const accessToken = await getAccessToken();
   const bearer = `Bearer ${accessToken}`;

   return {
      Authorization: bearer,
      Apikey: environment.SUPABASE_ANON_KEY,
   };
}
