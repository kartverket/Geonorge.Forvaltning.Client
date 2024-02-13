import { forwardRef, useEffect, useRef, useState } from 'react';
import { hasError } from '../helpers';
import styles from '../Form.module.scss';

const INPUT_TYPES = {
   'text': 'text',
   'number': 'number',
   'numeric': 'number',
   'date': 'date'
};

const TextField = forwardRef(({ id, name, type, value, onChange, label, error, errorMessage, mode = 'change', disabled, className = '' }, ref) => {
   const [_value, setValue] = useState(value || '');
   const valueRef = useRef(value || '');

   useEffect(
      () => {
         setValue(value || '');
         valueRef.current = value;
      },
      [value]
   );

   function getRandomId() {
      return Math.random().toString(36).replace(/[^a-z]+/g, '');
   }

   function handleChange(event) {
      const newValue = event.target.value;
      setValue(newValue);

      if (mode === 'change') {
         const payload = { target: { name, value: event.target.value } };
         onChange(payload);
      } 
   }

   function handleBlur(event) {
      if (mode === 'blur') {
         const newValue = event.target.value;

         if (newValue !== valueRef.current) {
            const payload = { target: { name, value: event.target.value } };
            onChange(payload);
            valueRef.current = newValue;
         }
      }
   }

   return (
      <div className={`${styles.textField} ${className}`}>
         {
            label ?
               <gn-label block="">
                  <label htmlFor={id}>{label}</label>
               </gn-label> :
               null
         }
         <gn-input width="" block="">
            <input
               id={id}
               ref={ref}
               name={getRandomId()}               
               type={INPUT_TYPES[type] || 'text'}     
               value={_value}
               onChange={handleChange}
               onBlur={handleBlur}
               disabled={disabled} 
            />
         </gn-input>
         {
            hasError(error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
});

TextField.displayName = 'TextField';

export default TextField;