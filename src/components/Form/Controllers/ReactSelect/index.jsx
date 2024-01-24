import { useRef } from 'react';
import { customStyles, customTheme } from 'config/react-select';
import { hasError } from '../helpers';
import Select from 'react-select';
import styles from '../Controllers.module.scss';

export default function ReactSelect({ field, fieldState, options, onChange, isMulti, placeholder = '', noOptionsMessage = 'Ingen valg', errorMessage, label, className }) {
   const selectRef = useRef(null);

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
            name={field.name}
            ref={selectRef}
            value={options.length > 0 ? field.value : null}
            options={options}
            onChange={field.onChange}
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
            hasError(fieldState.error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
}