const environment = {
   API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
   AUTH_REDIRECT_TO: import.meta.env.VITE_AUTH_REDIRECT_TO,
   SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
   SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
   ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
   BUILD_VERSION_NUMBER: import.meta.env.VITE_BUILD_VERSION_NUMBER,
   SUPABASE_MAX_ROWS: 1000,
   DATASET_SRID: 4326,
   MAP_EPSG: "EPSG:3857",
   TAG_DATASET_ID: parseInt(import.meta.env.VITE_TAG_DATASET_ID),
   COUNTY_GOVERNORS: import.meta.env.VITE_COUNTY_GOVERNORS.split(",").map(
      (orgNo) => orgNo.trim()
   ),
   API_BRREG_URL: import.meta.env.VITE_API_BRREG_URL,
};

export default environment;
