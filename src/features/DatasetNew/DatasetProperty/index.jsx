import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Select, TextField } from 'components/Form';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import styles from './DatasetProperty.module.scss';

const DATA_TYPES = [
   { value: 'text', label: 'Tekst' },
   { value: 'numeric', label: 'Tall' },
   { value: 'bool', label: 'Ja/Nei' },
   { value: 'timestamp', label: 'Dato-tid' },
];

export default function DatasetProperty({ index }) {
   const { control, setValue, getValues } = useFormContext();
   const dataType = useWatch({ name: `properties.${index}.dataType` });
   const allowedValues = useWatch({ name: `properties.${index}.allowedValues` });
   const { showModal } = useModal();

   async function openAllowedValuesModal() {
      const values = getValues(`properties.${index}.allowedValues`) || [];

      const { data } = await showModal({
         type: modalType.ALLOWED_VALUES,
         values
      });

      if (data !== null) {
         setValue(`properties.${index}.allowedValues`, data.length > 0 ? data : null);
      }
   }

   return (
      <div className={styles.property}>
         <div>
            <Controller
               control={control}
               name={`properties.${index}.name`}
               rules={{
                  validate: value => value.trim().length > 0
               }}
               render={({ field, fieldState: { error } }) => (
                  <TextField
                     id={`properties.${index}.name`}
                     label="Navn"
                     {...field}
                     error={error}
                     errorMessage="Navn må fylles ut"
                     className={styles.textField}
                  />
               )}
            />
         </div>
         <div>
            <Controller
               control={control}
               name={`properties.${index}.dataType`}
               rules={{
                  required: true
               }}
               render={({ field, fieldState: { error } }) => (
                  <Select
                     id={`properties.${index}.dataType`}
                     {...field}
                     options={DATA_TYPES}
                     error={error}
                     label="Datatype"
                     errorMessage="Datatype må velges"
                     className={styles.dataType}
                  />
               )}
            />
         </div>
         {
            dataType === 'text' ?
               <div className={styles.allowedValues}>
                  <gn-button>
                     <button
                        onClick={openAllowedValuesModal}
                        title={allowedValues?.length ? `${allowedValues.join(', ')} (${allowedValues.length})` : null}
                     >
                        Tillatte verdier ({allowedValues?.length ? allowedValues.length : 'alle'})
                     </button>
                  </gn-button>
               </div> :
               null
         }
      </div>
   )
}