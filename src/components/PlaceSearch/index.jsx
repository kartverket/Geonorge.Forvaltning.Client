import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDataset } from 'context/DatasetProvider';
import { zoomTo } from 'store/slices/mapSlice';
import useDebounce from 'hooks/useDebounce'
import AsyncSelect from 'react-select/async';
import axios from 'axios';
import environment from 'config/environment';
import './PlaceSearch.scss';

export default function PlaceSearch() {
   const { definition } = useDataset();
   const crs = definition.srid || 4326;
   const [inputValue, setInputValue] = useState('');
   const [value, setValue] = useState(null);
   const dispatch = useDispatch();

   const loadOptions = useDebounce(
      (query, callback) => {
         const _query = query.replace(/\s+/g, ' ').trim();

         if (_query.length >= 3) {
            const url = `${environment.API_BASE_URL}/placesearch/${query}/${crs}`;

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
      dispatch(zoomTo(value));
   }

   return (
      <AsyncSelect
         loadOptions={loadOptions}
         value={value}
         inputValue={inputValue}
         onInputChange={setInputValue}
         onChange={handleChange}
         cacheOptions
         getOptionValue={option => option.id}
         getOptionLabel={option => option.properties.name}
         formatOptionLabel={({ properties }) => (
            <div className="rs-custom-option">
               <span>{properties.name}</span>
               <span>{properties.objectType}, {properties.municipality} ({properties.county})</span>
            </div>
         )}
         placeholder="Søk etter steder"
         noOptionsMessage={() => 'Ingen steder funnet'}
         loadingMessage={() => 'Leter...'}         
         defaultOptions
         styles={customStyles}
         classNamePrefix="rs"
      />
   );
}

const customStyles = {
   control: base => ({
      ...base,
      minHeight: '32px',
      height: '32px',
      width: '312px',
      border: '1px solid #d8d8d8',
      borderRadius: '4px',
      fontSize: '15px',
      cursor: 'text',
      boxShadow: 'none',
      '&:hover': {
         borderColor: '#d8d8d8'
      },
      '&.rs__control--is-focused': {
         /*borderColor: 'transparent',
         outline: '-webkit-focus-ring-color solid 2px !important',
         outlineOffset: '-1px'*/
      }
   }),
   valueContainer: base => ({
      ...base,
      height: '32px',
      padding: '0 6px'
   }),
   input: base => ({
      ...base,
      margin: '-1px 0 0 3px',
   }),
   placeholder: base => ({
      ...base,
      marginTop: '-1px'
   }),
   indicatorSeparator: () => ({
      display: 'none',
   }),
   indicatorsContainer: base => ({
      ...base,
      display: 'none'
   }),
   menu: base => ({
      ...base,
      maxWidth: '400px',
      borderRadius: '4px',
      boxShadow: 'none',
      border: '1px solid #d8d8d8'
   }),
   loadingMessage: base => ({
      ...base,
      textAlign: 'left',
      padding: '2px 10px'
   }),
   noOptionsMessage: base => ({
      ...base,
      textAlign: 'left',
      padding: '2px 10px'
   })
};