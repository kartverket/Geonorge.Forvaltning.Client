import { useRef } from 'react';
import { customStyles, customTheme } from 'config/react-select';
import { hasError } from '../helpers';
import Select from 'react-select';
import styles from '../Form.module.scss';

export default function ReactSelect({ name, value, options, onChange, error, isMulti, placeholder = '', noOptionsMessage = 'Ingen valg', errorMessage, label, className }) {
   const selectRef = useRef(null);

   function handleChange(value) {
      const payload = { target: { name, value } };
      onChange(payload)
   }

   return (
      <div>
         {
            label ?
               <gn-label block="">
                  <label onClick={() => selectRef.current.focus()}>{label}</label>
               </gn-label> :
               null
         }
         <Select
            name={name}
            ref={selectRef}
            value={options.length > 0 ? value : null}
            options={options}
            onChange={handleChange}
            getOptionLabel={({ value }) => options.find(option => option.value === value)?.label || 'Ukjent'}
            isMulti={isMulti}
            placeholder={placeholder}
            noOptionsMessage={() => noOptionsMessage}
            menuPlacement="auto"
            menuPosition="fixed"
            theme={customTheme}
            styles={customStyles}
            className={className}
         />
         {
            hasError(error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
}
