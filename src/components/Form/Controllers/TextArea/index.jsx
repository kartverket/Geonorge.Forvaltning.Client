import { hasError } from '../helpers';
import styles from '../Controllers.module.scss';

export default function TextArea({ id, field, fieldState, errorMessage, label, optional = false, className }) {
   return (
      <div className={`${styles.textArea} ${className}`}>
         {
            label ?
               <gn-label block="">
                  <label htmlFor={id}>
                     {label}
                     {optional && <span className={styles.optional}>- Valgfri</span>}
                  </label>
               </gn-label> :
               null
         }
         <gn-textarea block="">
            <textarea
               id={id}
               {...field}
            >
            </textarea>
         </gn-textarea>
         {
            hasError(fieldState.error) ?
               <div className={styles.error}>{errorMessage}</div> :
               null
         }
      </div>
   );
}