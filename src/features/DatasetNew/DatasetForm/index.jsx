import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Checkbox, TextArea, TextField } from 'components/Form';
import DatasetProperty from '../DatasetProperty';
import styles from './DatasetForm.module.scss';

export default function DatasetForm() {
   const { control } = useFormContext();
   const { fields, insert, remove } = useFieldArray({ control, name: 'properties' });

   function addProperty(index) {
      insert(index + 1, { name: '', dataType: '' });
   }

   function removeProperty(index) {
      remove(index);
   }

   return (
      <>
         <div className={styles.object}>
            <div className={styles.row}>
               <Controller
                  control={control}
                  name="name"
                  rules={{
                     validate: value => value.trim().length > 0
                  }}
                  render={({ field, fieldState: { error } }) => (
                     <TextField
                        id="name"
                        label="Navn"
                        {...field}
                        error={error}
                        errorMessage="Navn må fylles ut"
                        className={styles.textField}
                     />
                  )}
               />
            </div>

            <div className={styles.row}>
               <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                     <TextArea
                        id="description"
                        label="Beskrivelse"
                        {...field}
                        optional={true}
                        className={styles.textArea}
                     />
                  )}
               />
            </div>

            <div className={styles.row}>
               <Controller
                  control={control}
                  name="isopendata"
                  render={({ field }) => (
                     <Checkbox
                        id="isopendata"
                        label="Åpne data"
                        {...field}
                     />
                  )}
               />
            </div>
         </div>

         <heading-text>
            <h3 className={styles.h3}>Egenskaper</h3>
         </heading-text>

         <div className={styles.properties}>
            {
               fields.map((field, index) => (
                  <div key={field.id} className={styles.property}>
                     <DatasetProperty index={index} />

                     <div className={styles.propertyButtons}>
                        <button onClick={() => addProperty(index)} className={styles.addButton}></button>
                        {
                           fields.length > 1 ?
                              <button onClick={() => removeProperty(index)} className={styles.removeButton}></button> :
                              null
                        }
                     </div>
                  </div>
               ))
            }
         </div>
      </>
   );
}