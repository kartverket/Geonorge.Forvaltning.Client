import { useMemo } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Checkbox, ReactSelect, TextArea, TextField } from 'components/Form/Controllers';
import { useGetDatasetDefinitionsQuery } from 'store/services/api';
import DatasetProperty from '../DatasetProperty';
import styles from './DatasetForm.module.scss';

export default function DatasetForm() {
   const { control, getValues } = useFormContext();
   const { fields, insert, remove } = useFieldArray({ control, name: 'properties' });
   const { data: definitions = null } = useGetDatasetDefinitionsQuery();
   const datasetId = getValues('id');

   const datasetOptions = useMemo(
      () => {
         if (definitions === null) {
            return [];
         }

         return definitions
            .filter(definition => definition.Id !== datasetId)
            .map(definition => ({ value: definition.Id, label: definition.Name }));
      },
      [definitions, datasetId]
   );

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

         <heading-text>
            <h3 className={styles.h3}>Analyse</h3>
         </heading-text>

         <div className="panel">
            <Controller
               control={control}
               name="attachedForvaltningObjektMetadataIds"
               render={props => (
                  <ReactSelect
                     id="attached-datasets"
                     label="Tilknyttede datasett"
                     options={datasetOptions}
                     isMulti={true}
                     noOptionsMessage="Ingen datasett funnet"
                     className={styles.attachedDatasets}
                     {...props}
                  />
               )}
            />
         </div>
      </>
   );
}