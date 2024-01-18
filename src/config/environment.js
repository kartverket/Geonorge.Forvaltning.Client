const environment = {
   'API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
   'AUTH_REDIRECT_TO': import.meta.env.VITE_AUTH_REDIRECT_TO,
   'SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
   'SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,   
   'ENVIRONMENT': import.meta.env.VITE_ENVIRONMENT,
   'BUILD_VERSION_NUMBER': import.meta.env.VITE_BUILD_VERSION_NUMBER,
   'SUPABASE_MAX_ROWS': 1000,
   'DATASET_SRID': 4326,
   'MAP_EPSG': 'EPSG:3857'
};

export default environment;