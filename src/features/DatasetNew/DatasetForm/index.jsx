import { useMemo } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Checkbox, Select, TextArea, TextField } from 'components/Form/Controllers';
import projections from 'config/map/projections.json';
import DatasetProperty from '../DatasetProperty';
import styles from './DatasetForm.module.scss';

export default function DatasetForm() {
   const { control } = useFormContext();
   const { fields, insert, remove } = useFieldArray({ control, name: 'properties' });
   const projOptions = useMemo(() => projections.map(projection => ({ value: projection.srId, label: projection.epsg })), []);

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
                  render={props => (
                     <TextField
                        id="name"
                        label="Navn"
                        errorMessage="Navn må fylles ut"
                        className={styles.textField}
                        {...props}
                     />
                  )}
               />
            </div>

            <div className={styles.row}>
               <Controller
                  control={control}
                  name="description"
                  render={props => (
                     <TextArea
                        id="description"
                        label="Beskrivelse"
                        optional={true}
                        className={styles.textArea}
                        {...props}
                     />
                  )}
               />
            </div>

            <div className={styles.row}>
               <Controller
                  control={control}
                  name="srid"
                  rules={{
                     required: true
                  }}
                  render={props => (
                     <Select
                        id="srid"
                        options={projOptions}
                        label="Projeksjon"
                        allowEmpty={false}
                        className={styles.projection}
                        {...props}
                        onChange={event => {
                           const target = { ...event.target };
                           target.value = parseInt(event.target.value);
                           props.field.onChange({ target });
                        }}
                     />
                  )}
               />
            </div>

            <div className={styles.row}>
               <Controller
                  control={control}
                  name="isopendata"
                  render={props => (
                     <Checkbox
                        id="isopendata"
                        label="Åpne data"
                        {...props}
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