import { useEffect, useState, useRef } from 'react';
import styles from './TextField.module.scss';

const INPUT_TYPES = {
   'numeric': 'number',
   'text': 'text'
};

export default function TextField({ name, value, onChange, type, disabled, mode = 'change' }) {   
   const [_value, setValue] = useState(value || '');
   const nameRef = useRef(name);
   const valueRef = useRef(value || '');

   useEffect(
      () => {
         setValue(value || '');
         valueRef.current = value;
      },
      [value]
   );

   function handleChange(event) {
      const newValue = event.target.value;
      setValue(newValue);

      if (mode === 'change') {
         onChange({ name: nameRef.current, value: newValue !== '' ? newValue : null });
      } 
   }

   function handleBlur(event) {
      if (mode === 'blur') {
         const newValue = event.target.value;

         if (newValue !== valueRef.current) {
            onChange({ name: nameRef.current, value: newValue !== '' ? newValue : null });
            valueRef.current = newValue;
         }
      }
   }

   function getRandomId() {
      return Math.random().toString(36).replace(/[^a-z]+/g, '');
   }

   return (
      <div className={styles.textField}>
         <gn-input width="" block="">
            <input
               name={getRandomId()}
               value={_value}
               onChange={handleChange}
               onBlur={handleBlur}
               disabled={disabled}  
               type={INPUT_TYPES[type] || 'text'}     
               autoComplete="chrome-off"
            />
         </gn-input>
      </div>
   );
}