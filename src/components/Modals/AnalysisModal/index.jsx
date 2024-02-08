import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useAnalayzeMutation, useGetDatasetDefinitionsQuery } from 'store/services/api';
import { Select, TextField } from 'components/Form';
import { useModal } from 'context/ModalProvider';
import { modalType } from '..';
import Filter from './Filter';
import Spinner from 'components/Spinner';
import styles from './AnalysisModal.module.scss';

export default function AnalysisModal({ datasetId, objectId, datasetIds, onClose, callback }) {
   const [propertyOptions, setPropertyOptions] = useState([]);
   const [metadata, setMetadata] = useState([]);
   const [loading, setLoading] = useState(false);
   const methods = useForm({ defaultValues: getDefaultValues() });
   const { control, setValue, handleSubmit } = methods;
   const { fields, insert, remove } = useFieldArray({ control, name: 'filters' });
   const { data: definitions = null } = useGetDatasetDefinitionsQuery();
   const [analyze] = useAnalayzeMutation();
   const selectedTargetDatasetId = useWatch({ control, name: 'targetDatasetId' });
   const { showModal } = useModal();

   const datasetOptions = useMemo(
      () => {
         if (definitions === null) {
            return [];
         }

         const options = definitions
            .filter(definition => datasetIds.includes(definition.Id))
            .map(definition => ({ value: definition.Id, label: definition.Name }));

         return options;
      },
      [definitions, datasetIds]
   );

   useEffect(
      () => {
         if (datasetOptions.length) {
            setValue('targetDatasetId', datasetOptions[0].value);
         }
      },
      [datasetOptions, setValue]
   );

   useEffect(
      () => {
         if (selectedTargetDatasetId !== '') {
            const targetDatasetId = parseInt(selectedTargetDatasetId);
            const definition = definitions.find(definition => definition.Id === targetDatasetId);
            const metadata = definition.ForvaltningsObjektPropertiesMetadata;
            const options = metadata.map(data => ({ value: data.ColumnName, label: data.Name }));

            setMetadata(metadata);
            setPropertyOptions(options);
            setValue('filters', []);
         }
      },
      [selectedTargetDatasetId, definitions, setValue]
   );

   function handleOk() {
      handleSubmit(async model => {
         const payload = toPayload(model);
         setLoading(true);

         try {
            const response = await analyze({ payload });
            setLoading(false);

            if (response.data.features.length <= 1) {
               await showModal({
                  type: modalType.INFO,
                  variant: 'success',
                  title: 'Analyseresultat',
                  body: 'Fant ingen objekter i henhold til kriteriene.'
               });
            } else {
               onClose();
               callback({ result: true, data: response.data });
            }
         } catch (error) {
            console.error(error);
            setLoading(false);

            await showModal({
               type: modalType.INFO,
               variant: 'error',
               title: 'Feil',
               body: 'Analysen kunne ikke gjennomføres.'
            });
         }
      })();
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

   function getDefaultValues() {
      return {
         datasetId,
         objectId,
         targetDatasetId: '',
         count: 1,
         filters: [],
         distance: 5
      };
   }

   function toPayload(model) {
      const { filters, ...payload } = model;

      payload.filters = filters.map(filter => ({
         property: filter.property,
         value: filter.value !== '' ? filter.value : null
      }));

      return payload;
   }

   return (
      <div className={styles.modal}>
         <h1>Analyse</h1>

         <div className={styles.body}>
            <div className={styles.description}>
               Finn ruter til nærmeste objekter for et gitt datasett, innenfor en gitt avstand.
            </div>

            <FormProvider {...methods}>
               <div className={styles.form}>
                  <div className={styles.row}>
                     <Controller
                        control={control}
                        name="targetDatasetId"
                        rules={{
                           required: true
                        }}
                        render={({ field }) => (
                           <Select
                              id="targetDatasetId"
                              options={datasetOptions}
                              label="Datasett"
                              {...field}
                              allowEmpty={false}
                              className={styles.select}
                           />
                        )}
                     />
                  </div>

                  <div className={styles.label}>Filter</div>
                  {
                     fields.length > 0 ?
                        fields.map((field, index) => (
                           <div key={field.id} className={styles.filter}>
                              <Filter
                                 index={index}
                                 metadata={metadata}
                                 propertyOptions={propertyOptions}
                              />

                              <div className={styles.filterButtons}>
                                 <button onClick={() => addFilter(index)} className={styles.addButton}></button>
                                 <button onClick={() => removeFilter(index)} className={styles.removeButton}></button>
                              </div>
                           </div>
                        )) :
                        <div className={styles.noFilters}>
                           <gn-button>
                              <button onClick={addFilter} className={styles.addButton}>Legg til filter</button>
                           </gn-button>
                        </div>
                  }

                  <div className={styles.row}>
                     <Controller
                        control={control}
                        name="count"
                        rules={{
                           validate: value => {
                              const count = parseFloat(value);
                              return Number.isInteger(count) && count >= 1 && count <= 10;
                           }
                        }}
                        render={({ field, fieldState: { error } }) => (
                           <TextField
                              id="count"
                              type="number"
                              label="Antall objekter"
                              {...field}
                              error={error}
                              errorMessage="Antallet må være et heltall fra 1 til 10"
                              className={styles.textField}
                           />
                        )}
                     />
                  </div>

                  <div className={styles.row}>
                     <Controller
                        control={control}
                        name="distance"
                        rules={{
                           validate: value => {
                              const distance = parseFloat(value);
                              return Number.isInteger(distance) && distance >= 1 && distance <= 100;
                           }
                        }}
                        render={({ field, fieldState: { error } }) => (
                           <TextField
                              id="distance"
                              type="number"
                              label="Avstand (km)"
                              {...field}
                              error={error}
                              errorMessage="Avstanden må være et heltall fra 1 til 100 (km)"
                              className={styles.textField}
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
            {
               loading && <Spinner style={{ margin: '2px 0 0 12px' }} />
            }
         </div>
      </div>
   );
}