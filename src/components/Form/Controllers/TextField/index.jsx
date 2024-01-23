import { hasError } from '../helpers';
import styles from '../Controllers.module.scss';
import { isFunction } from 'lodash';

export default function TextField({ id, field, fieldState, onChange, errorMessage, label, className }) {
   function getRandomId() {
      return Math.random().toString(36).replace(/[^a-z]+/g, '');
   }

   function handleChange(event) {
      const payload = { target: { name: field.name, value: event.target.value } };

      if (isFunction(onChange)) {
         onChange(payload);
      } else {
         field.onChange(payload);
      }
   }

   return (
      <div className={className}>
         {
            label ?
               <gn-label block="">
                  <label htmlFor={id}>{label}</label>
               </gn-label> :
               null
         }
         <gn-input block="">
            <input
               id={id}
               type="text"
               {...field}
               name={getRandomId()}
               onChange={handleChange}
            />
         </gn-input>
         {
            hasError(fieldState.error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
}