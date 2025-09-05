import { forwardRef, useEffect, useRef, useState } from "react";
import { hasError } from "../helpers";
import styles from "../Form.module.scss";

const TextArea = forwardRef(
   (
      {
         id,
         name,
         value,
         onChange,
         error,
         errorMessage,
         label,
         optional = false,
         className = "",
      },
      ref
   ) => {
      const [_value, setValue] = useState(value || "");
      const valueRef = useRef(value || "");

      useEffect(() => {
         setValue(value || "");
         valueRef.current = value;
      }, [value]);

      function handleChange(event) {
         const newValue = event.target.value;
         setValue(newValue);

         const payload = { target: { name, value: newValue } };
         onChange(payload);
      }

      return (
         <div className={`${styles.textArea} ${className}`}>
            {label ? (
               <gn-label block="">
                  <label htmlFor={id}>
                     {label}
                     {optional && (
                        <span className={styles.optional}>- Valgfri</span>
                     )}
                  </label>
               </gn-label>
            ) : null}
            <gn-textarea block="">
               <textarea
                  id={id}
                  ref={ref}
                  name={name}
                  value={_value}
                  onChange={handleChange}
               ></textarea>
            </gn-textarea>
            {hasError(error) ? (
               <div className={styles.error}>{errorMessage}</div>
            ) : null}
         </div>
      );
   }
);

TextArea.displayName = "TextArea";

export default TextArea;
