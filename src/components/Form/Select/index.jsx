import { forwardRef, useEffect, useState } from 'react';
import { isNil } from 'lodash';
import { hasError } from '../helpers';
import styles from '../Form.module.scss';

const Select = forwardRef(({ id, name, value, options, onChange, label, error, errorMessage, disabled, allowEmpty = true, className = '' }, ref) => {
   const [_value, setValue] = useState(!isNil(value) ? value : '');

   useEffect(
      () => {
         setValue(!isNil(value) ? value : '');         
      },
      [value]
   );

   function handleChange(event) {
      const newValue = event.target.value;
      setValue(newValue);

      const payload = { target: { name: event.target.name, value: newValue } };
      onChange(payload);
   }

   return (
      <div className={`${styles.select} ${className} ${disabled ? styles.disabled : ''}`}>
         {
            label ?
               <gn-label block="">
                  <label htmlFor={id}>{label}</label>
               </gn-label> :
               null
         }
         <gn-select block="" fullwidth="">
            <select
               id={id}
               ref={ref}
               name={name}
               value={_value}
               onChange={handleChange}
            >
               {
                  allowEmpty ?
                     <option value="">-</option> :
                     null
               }
               {
                  options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)
               }
            </select>
         </gn-select>
         {
            hasError(error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
});

Select.displayName = 'Select';

export default Select;