import { hasError } from '../helpers';
import styles from '../Controllers.module.scss';

export default function Select({ id, field, fieldState, options, onChange, errorMessage, label, allowEmpty = true, className }) {
   return (
      <div className={className}>
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
               onChange={onChange || field.onChange}
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
            hasError(fieldState.error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
}