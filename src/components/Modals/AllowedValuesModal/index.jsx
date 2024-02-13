import { Controller, useForm } from 'react-hook-form';
import { Tags } from 'components/Form';
import styles from './AllowedValuesModal.module.scss';

export default function AllowedValuesModal({ values, onClose, callback }) {   
   const { control, getValues } = useForm({ values: { allowedValues: values } });

   function handleOk() {
      onClose();
      callback({ result: true, data: getValues('allowedValues') });
   }

   function handleClose() {
      onClose();
      callback({ result: false, data: null });
   }

   return (
      <div className={styles.modal}>
         <h1>Tillatte verdier</h1>

         <div className={styles.body}>
            <Controller
               control={control}
               name="allowedValues"
               render={({ field }) => (
                  <Tags
                     placeholder="Legg til tillatt verdi..."
                     className={styles.allowedValues}
                     {...field}
                  />
               )}
            />
         </div>

         <div className={styles.buttons}>
            <gn-button>
               <button onClick={handleClose}>Avbryt</button>
            </gn-button>

            <gn-button>
               <button onClick={handleOk}>OK</button>
            </gn-button>
         </div>
      </div>
   );
}