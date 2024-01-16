import { useEffect, useState } from 'react';
import { isNil } from 'lodash';
import styles from './BooleanSelect.module.scss';

export default function BooleanSelect({ name, value, onChange, disabled }) {
   const [_value, setValue] = useState(!isNil(value) ? value : '');
   
   useEffect(
      () => {
         setValue(!isNil(value) ? value : '');
      },
      [value]
   );

   function getValue(newValue) {
      if (newValue === '') {
         return null;
      }

      return newValue === 'true' ? true : false;
   }

   function handleChange(event) {     
      const newValue = event.target.value;
      setValue(newValue);
      onChange({ name: event.target.name, value: getValue(newValue) });
   }

   return (
      <div className={`${styles.select} ${disabled ? styles.disabled : ''}`}>
         <gn-select block="" fullwidth="">
            <select
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
      </div>
   );
}