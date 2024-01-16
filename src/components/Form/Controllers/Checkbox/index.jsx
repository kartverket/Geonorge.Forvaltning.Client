import styles from '../Controllers.module.scss';

export default function Checkbox({ id, field, label, className }) {
   return (
      <div className={`${styles.checkbox} ${className}`}>
         <gn-input>
            <input
               id={id}
               type="checkbox"
               {...field}
            />
         </gn-input>
         {
            label ?
               <gn-label>
                  <label htmlFor={id}>{label}</label>
               </gn-label> :
               null
         }
      </div>
   );
}