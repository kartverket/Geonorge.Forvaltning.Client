import { forwardRef, useEffect, useState } from 'react';
import { isNil } from 'lodash';
import { hasError } from '../helpers';
import styles from '../Form.module.scss';

const BooleanSelect = forwardRef(({ id, name, value, onChange, error, errorMessage, label, disabled, className = '' }, ref) => {
   const [_value, setValue] = useState(!isNil(value) ? value : '');
   
   useEffect(
      () => {
         setValue(!isNil(value) ? value : '');
      },
      [value]
   );

   function getValue(newValue) {
      if (newValue === '') {
         return '';
      }

      return newValue === 'true' ? true : false;
   }

   function handleChange(event) {     
      const newValue = event.target.value;
      setValue(newValue);

      const payload = { target: { name, value: getValue(newValue) } };
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
               disabled={disabled}
            >
               <option value="">-</option>
               <option value="true">Ja</option>
               <option value="false">Nei</option>
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

BooleanSelect.displayName = 'BooleanSelect';

export default BooleanSelect;