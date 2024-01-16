import { hasError } from '../helpers';
import styles from '../Controllers.module.scss';

export default function TextField({ id, field, fieldState, errorMessage, label, className }) {   
   function getRandomId() {
      return Math.random().toString(36).replace(/[^a-z]+/g, '');
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
               onChange={event => field.onChange({ target: { name: field.name, value: event.target.value }})}
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