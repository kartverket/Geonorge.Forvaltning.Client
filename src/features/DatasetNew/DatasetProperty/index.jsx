import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Select, TextField } from 'components/Form/Controllers';
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
               render={props => (
                  <TextField
                     id={`properties.${index}.name`}
                     label="Navn"
                     errorMessage="Navn må fylles ut"
                     className={styles.textField}
                     {...props}
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
               render={props => (
                  <Select
                     id={`properties.${index}.dataType`}
                     options={DATA_TYPES}
                     label="Datatype"
                     errorMessage="Datatype må velges"
                     className={styles.dataType}
                     {...props}
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