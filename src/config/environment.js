const environment = {
   API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
   API_BRREG_URL: import.meta.env.VITE_API_BRREG_URL,
   AUTH_REDIRECT_TO: import.meta.env.VITE_AUTH_REDIRECT_TO,
   BUILD_VERSION_NUMBER: import.meta.env.VITE_BUILD_VERSION_NUMBER,
   COUNTY_GOVERNORS: import.meta.env.VITE_COUNTY_GOVERNORS.split(",").map(
      (orgNo) => orgNo.trim()
   ),
   DATASET_SRID: 4326,
   ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
   MAP_EPSG: "EPSG:3857",
   SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
   SUPABASE_MAX_ROWS: 1000,
   SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
   TAG_DATASET_ID: parseInt(import.meta.env.VITE_TAG_DATASET_ID),
};

export default environment;
