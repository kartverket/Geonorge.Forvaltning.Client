import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker, Select, TextField, BooleanSelect } from 'components/Form';
import styles from './Filter.module.scss';

export default function Filter({ index, metadata, propertyOptions }) {
   const { control, setValue } = useFormContext();
   const [selectedProperty, setSelectedProperty] = useState(metadata[0].ColumnName);

   useEffect(
      () => {
         setValue(`filters.${index}.property`, metadata[0].ColumnName);
      },
      [index, metadata, setValue]
   );

   function getFormControl(props) {
      const column = metadata.find(column => column.ColumnName === selectedProperty);
      const dataType = column.DataType;

      if (dataType === 'bool') {
         return (
            <BooleanSelect
               {...props.field}
            />
         );
      }

      const allowedValues = column.AllowedValues;

      if (dataType === 'text' && allowedValues === null) {
         return (
            <TextField
               {...props.field}
            />
         );
      } else if (dataType === 'text') {
         const selectOptions = allowedValues.map(option => ({ value: option, label: option }));

         return (
            <Select
               options={selectOptions}
               {...props.field}
            />
         );
      }

      if (dataType === 'numeric') {
         return (
            <TextField
               type="number"
               {...props.field}
            />
         );
      }

      if (dataType === 'timestamp') {
         return (
            <DatePicker
               {...props.field}
            />
         );
      }

      return (
         <TextField
            {...props.field}
         />
      );
   }

   function handlePropertyChange(event, field) {
      field.onChange(event);
      setValue(`filters.${index}.value`, '');
      setSelectedProperty(event.target.value);
   }

   return (
      <div className={styles.filter}>
         <div className={styles.property}>
            <Controller
               control={control}
               name={`filters.${index}.property`}
               render={props => (
                  <Select
                     options={propertyOptions}
                     allowEmpty={false}
                     {...props}
                     onChange={event => handlePropertyChange(event, props.field)}
                  />
               )}
            />
         </div>

         <div className={styles.value}>
            <Controller
               control={control}
               name={`filters.${index}.value`}
               render={props => getFormControl(props)}
            />
         </div>
      </div>
   );
}