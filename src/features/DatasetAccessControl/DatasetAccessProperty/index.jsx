import { useMemo, useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Select } from 'components/Form';
import DatasetAccessPropertyValue from '../DatasetAccessPropertyValue';
import styles from '../DatasetAccessControl.module.scss';

export default function DatasetAccessProperty({ index, metadata }) {
   const { control, setValue, getValues } = useFormContext();
   const [selectedProperty, setSelectedProperty] = useState(getSelectedProperty());
   const { fields, append, remove } = useFieldArray({ control, name: `accessByProperties.${index}.values` });
   const selectedProperties = useWatch({ control, name: 'accessByProperties' });

   const properties = useMemo(
      () => {
         return metadata
            .filter(data => data.Id === selectedProperty?.Id || !selectedProperties.some(property => property.propertyId === data.Id))
            .map(data => ({ value: data.Id, label: data.Name }));
      },
      [metadata, selectedProperty, selectedProperties]
   );

   function getSelectedProperty() {
      const propertyId = getValues(`accessByProperties.${index}.propertyId`);
      const property = metadata.find(data => data.Id === propertyId) || null;

      return property;
   }

   function handlePropertyChange(event, field) {
      const target = { ...event.target };
      const newValue = event.target.value;

      target.value = newValue !== '' ? parseInt(newValue) : '';
      const property = metadata.find(data => data.Id === target.value) || null;

      setValue(`accessByProperties.${index}.values`, [getDefaultValues(property.Id)]);
      setSelectedProperty(property);

      field.onChange({ target });
   }

   function getDefaultValues(propertyId) {
      return {
         propertyId,
         value: '',
         contributors: [],
         viewers: []
      };
   }

   function addPropertyValue() {
      const propertyId = getValues(`accessByProperties.${index}.propertyId`);
      append(getDefaultValues(propertyId));
   }

   function removePropertyValue(index) {
      remove(index);
   }

   return (
      <div className={styles.form}>
         <div className={styles.row}>
            <Controller
               control={control}
               name={`accessByProperties.${index}.propertyId`}
               rules={{
                  required: true
               }}
               render={({ field, fieldState: { error } }) => (
                  <Select
                     id={`accessByProperties.${index}.propertyId`}
                     options={properties}
                     label="Egenskap"
                     {...field}
                     error={error}
                     errorMessage="Egenskap må velges"
                     className={styles.select}
                     onChange={event => handlePropertyChange(event, field)}
                  />
               )}
            />
         </div>
         {
            selectedProperty !== null ?
               <div className={styles.valueRows}>
                  {
                     fields.map((field, valueIndex) => (
                        <div key={field.id} className={styles.valueRow}>
                           <DatasetAccessPropertyValue
                              valueIndex={valueIndex}
                              propertyIndex={index}
                              property={selectedProperty}
                           />

                           <div className={styles.buttons}>
                              {
                                 valueIndex === fields.length - 1 ?
                                    <gn-button>
                                       <button onClick={addPropertyValue} className={styles.addButton}>Legg til</button>
                                    </gn-button> :
                                    null
                              }
                              {
                                 fields.length > 1 ?
                                    <gn-button>
                                       <button onClick={() => removePropertyValue(valueIndex)} className={styles.removeButton}>Fjern</button>
                                    </gn-button> :
                                    null
                              }
                           </div>
                        </div>
                     ))
                  }
               </div> :
               null
         }
      </div>
   );
}