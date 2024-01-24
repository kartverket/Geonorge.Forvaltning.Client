import { Controller, useForm } from 'react-hook-form';
import styles from './AnalysisModal.module.scss';
import { useGetDatasetDefinitionsQuery } from 'store/services/api';
import { useEffect, useMemo, useState } from 'react';
import { Select, TextField } from 'components/Form/Controllers';

export default function AnalysisModal({ datasetId }) {
   const { control, getValues } = useForm({ defaultValues: getDefaultValues() });
   const { data: definitions = null } = useGetDatasetDefinitionsQuery();

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

   function handleOk() {
      onClose();
      callback({ result: true, data: null });
   }

   function handleClose() {
      onClose();
      callback({ result: false, data: null });
   }

   function handleDatasetChange(event, field) {
      field.onChange(event);
   }

   function getDefaultValues() {
      return {
         dataset: '',
         count: 1,
         filter: '',
         distance: 1000
      }
   }

   return (
      <div className={styles.modal}>
         <h1>Finn nærmeste objekt</h1>

         <div className={styles.body}>
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