import styles from "./InfoModal.module.scss";

export default function InfoModal({
   title,
   body,
   okText = "OK",
   onClose,
   callback,
   variant,
   className = "",
}) {
   function handleOk() {
      onClose();
      callback({ result: true });
   }

   function getClassName() {
      let clsName = `${styles.modal} ${className}`;

      switch (variant) {
         case "success":
            return `${clsName} ${styles.success}`;
         case "warning":
            return `${clsName} ${styles.warning}`;
         case "error":
            return `${clsName} ${styles.error}`;
         default:
            return clsName;
      }
   }

   return (
      <div className={getClassName()}>
         <h1>{title}</h1>

         <div className={styles.body}>{body}</div>

         <div className={styles.buttons}>
            <gn-button>
               <button onClick={handleOk}>{okText}</button>
            </gn-button>
         </div>
      </div>
   );
}
