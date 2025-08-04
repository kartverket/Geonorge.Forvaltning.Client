import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "./supabase/client";
import environment from "config/environment";

const createBaseQuery = (baseUrl) => {
   return fetchBaseQuery({
      baseUrl,
      prepareHeaders: async (headers) => {
         const accessToken = await getAccessToken();
         const bearer = `Bearer ${accessToken}`;

         headers.append("Authorization", bearer);
         headers.append("Apikey", environment.SUPABASE_ANON_KEY);

         return headers;
      },
   });
};

export default createBaseQuery;
