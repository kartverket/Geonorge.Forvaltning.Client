import { useState } from 'react';
import { useMap } from 'context/MapProvider';
import { zoomToGeoJsonFeature } from 'utils/helpers/map';
import { customTheme, customStyles } from 'config/react-select';
import useDebounce from 'hooks/useDebounce'
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import environment from 'config/environment';
import styles from './PlaceSearch.module.scss';

const MAP_CRS = 3857;

export default function PlaceSearch() {
   const { map } = useMap();
   const [inputValue, setInputValue] = useState('');
   const [value, setValue] = useState(null);
   
   const loadOptions = useDebounce(
      (query, callback) => {
         const _query = query.replace(/\s+/g, ' ').trim();

         if (_query.length >= 3) {
            const url = `${environment.API_BASE_URL}/placesearch/${query}/${MAP_CRS}`;

            axios.get(url)
               .then(response => {
                  callback(response.data.features);
               })
               .catch(() => {
                  callback([]);
               })
         } else {
            callback([]);
         }
      },
      1000
   );

   function handleChange(value) {
      setValue(null);
      zoomToGeoJsonFeature(map, value, 14);
   }

   return (
      <AsyncSelect
         loadOptions={loadOptions}
         className={styles.select}
         value={value}
         inputValue={inputValue}
         onInputChange={setInputValue}
         onChange={handleChange}
         cacheOptions
         getOptionValue={option => option.id}
         getOptionLabel={option => option.properties.name}
         formatOptionLabel={({ properties }) => (
            <div className={styles.customOption}>
               <span>{properties.name}</span>
               <span>{properties.objectType}, {properties.municipality} ({properties.county})</span>
            </div>
         )}
         placeholder="Søk etter steder"
         noOptionsMessage={() => 'Ingen steder funnet'}
         loadingMessage={() => 'Leter...'}         
         defaultOptions
         theme={customTheme}
         styles={customStyles}
      />
   );
}
