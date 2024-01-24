import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import styles from './AnalysisModal.module.scss';
import { useGetDatasetDefinitionsQuery } from 'store/services/api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Select, TextField } from 'components/Form/Controllers';
import Filter from './Filter';
import { getAllowedValuesForUser } from 'context/DatasetProvider/helpers';
import { useSelector } from 'react-redux';

export default function AnalysisModal({ datasetIds }) {
   const user = useSelector(state => state.app.user);
   const methods = useForm({ defaultValues: getDefaultValues() });
   const { control, getValues } = methods;
   const { fields, insert, remove } = useFieldArray({ control, name: 'filters' });
   const { data: definitions = null } = useGetDatasetDefinitionsQuery();
   const [propertyOptions, setPropertyOptions] = useState([]);
   const [metadata, setMetadata] = useState([]);

   const a = useWatch({ control });
   console.log(a)

   const datasetOptions = useMemo(
      () => {
         if (definitions === null) {
            return [];
         }

         return definitions
            .filter(definition => datasetIds.includes(definition.Id))
            .map(definition => ({ value: definition.Id, label: definition.Name }));
      },
      [definitions, datasetIds]
   );

   const allowedValues = useMemo(
      () => {
         const allowed = {};

         metadata.forEach(data => {
            allowed[data.ColumnName] = getAllowedValuesForUser(data.ColumnName, metadata, user);
         });

         return allowed;
      },
      [metadata, user]
   );

   function handleOk() {
      onClose();
      callback({ result: true, data: null });
   }

   function handleClose() {
      onClose();
      callback({ result: false, data: null });
   }

   function addFilter(index) {
      insert(index + 1, { property: '', value: '' });
   }

   function removeFilter(index) {
      remove(index);
   }


   function handleDatasetChange(event, field) {
      field.onChange(event);

      const value = event.target.value;

      if (value === '') {
         setPropertyOptions([]);
         setMetadata([]);
         return;
      }

      const datasetId = parseInt(value);
      const definition = definitions.find(definition => definition.Id === datasetId);
      const metadata = definition.ForvaltningsObjektPropertiesMetadata;
      const options = metadata.map(data => ({ value: data.ColumnName, label: data.Name }));

      setMetadata(metadata)
      setPropertyOptions(options);
   }

   function getDefaultValues() {
      return {
         dataset: '',
         count: 1,
         filters: [
            {
               property: '',
               value: ''
            }
         ],
         distance: 1000
      }
   }

   return (
      <div className={styles.modal}>
         <h1>Finn nærmeste objekt</h1>

         <div className={styles.body}>
            <FormProvider {...methods}>
               <div className={styles.form}>
                  <div className={styles.row}>
                     <Controller
                        control={control}
                        name="dataset"
                        rules={{
                           required: true
                        }}
                        render={props => (
                           <Select
                              id="dataset"
                              options={datasetOptions}
                              label="Datasett"
                              errorMessage="Datasett må velges"
                              {...props}
                              onChange={event => handleDatasetChange(event, props.field)}
                           />
                        )}
                     />
                  </div>

                  <h4>Filter</h4>

                  {
                     fields.length > 0 ?
                        fields.map((field, index) => (
                           <div key={field.id} className={styles.filter}>
                              <Filter
                                 index={index}
                                 metadata={metadata}
                                 propertyOptions={propertyOptions}
                                 allowedValues={allowedValues}
                              />

                              <div className={styles.filterButtons}>
                                 <button onClick={() => addFilter(index)} className={styles.addButton}></button>
                                 {
                                    fields.length > 1 ?
                                       <button onClick={() => removeFilter(index)} className={styles.removeButton}></button> :
                                       null
                                 }
                              </div>
                           </div>
                        )) :
                        null
                     // <div className={`panel ${styles.noProperties} ${styles.buttons}`}>
                     //    <gn-button>
                     //       <button onClick={addProperty} className={styles.addButton}>Legg til egenskap</button>
                     //    </gn-button>
                     // </div>
                  }

                  <div className={styles.row}>
                     <Controller
                        control={control}
                        name="count"
                        rules={{
                           required: true
                        }}
                        render={props => (
                           <TextField
                              id="count"
                              type="number"
                              label="Antall"
                              errorMessage="Antall må velges"
                              {...props}
                           />
                        )}
                     />
                  </div>

                  <div className={styles.row}>
                     <Controller
                        control={control}
                        name="distance"
                        rules={{
                           required: true
                        }}
                        render={props => (
                           <TextField
                              id="distance"
                              type="number"
                              label="Avstand (m)"
                              errorMessage="Avstand må velges"
                              {...props}
                           />
                        )}
                     />
                  </div>
               </div>
            </FormProvider>
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