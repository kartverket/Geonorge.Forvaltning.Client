import { hasError } from '../helpers';
import styles from '../Controllers.module.scss';

export default function BooleanSelect({ id, field, fieldState, onChange, errorMessage, label, disabled }) {
   function getValue(newValue) {
      if (newValue === '') {
         return '';
      }

      return newValue === 'true' ? true : false;
   }

   return (
      <div className={`${styles.select} ${disabled ? styles.disabled : ''}`}>
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
               {...field}
               onChange={event => {
                  const value = getValue(event.target.value);

                  if (onChange) {
                     onChange(value);
                  } else {
                     field.onChange(value);
                  }
               }}
               disabled={disabled}
            >
               <option value="">-</option>
               <option value="true">Ja</option>
               <option value="false">Nei</option>
            </select>
         </gn-select>
         {
            hasError(fieldState.error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
}