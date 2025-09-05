import { forwardRef } from "react";
import styles from "../Form.module.scss";

const Checkbox = forwardRef(
   ({ id, name, value, onChange, label, className = "" }, ref) => {
      return (
         <div className={`${styles.checkbox} ${className}`}>
            <gn-input>
               <input
                  id={id}
                  ref={ref}
                  type="checkbox"
                  name={name}
                  checked={value}
                  onChange={onChange}
               />
            </gn-input>
            {label ? (
               <gn-label>
                  <label htmlFor={id}>{label}</label>
               </gn-label>
            ) : null}
         </div>
      );
   }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
