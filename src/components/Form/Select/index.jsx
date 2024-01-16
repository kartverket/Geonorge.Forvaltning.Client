import { useEffect, useState } from 'react';
import { isNil } from 'lodash';
import styles from './Select.module.scss';

export default function Select({ name, value, options, onChange, disabled, allowEmpty = true }) {
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
      onChange({ name: event.target.name, value: newValue !== '' ? newValue : null });
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
               {
                  allowEmpty && <option value="">-</option>
               }
               {
                  options.map(option => <option key={option} value={option}>{option}</option>)
               }
            </select>
         </gn-select>
      </div>
   );
}