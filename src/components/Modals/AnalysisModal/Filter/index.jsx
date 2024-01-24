import { Select, TextField, BooleanSelect } from 'components/Form/Controllers';
import { Controller, useFormContext } from 'react-hook-form';
import styles from './Filter.module.scss';
import { useMemo, useState } from 'react';

export default function Filter({ index, metadata, propertyOptions, allowedValues }) {
   const { control } = useFormContext();
   const [column, setColumn] = useState(null);
   console.log(allowedValues);

   const valueFormControl = useMemo(
      () => {
         if (column === null) {
            return null;
         }

         const name = column.ColumnName;
         const dataType = column.DataType;
         let formControl;

         if (dataType === 'bool') {
            formControl = props => (
               <BooleanSelect
                  {...props}
               />
            );
         }

         const selectOptions = allowedValues[name];

         if (dataType === 'text' && selectOptions !== null) {
            const options = selectOptions.map(option => ({ value: option, label: option }));

            formControl = props => (
               <Select
                  options={options}
                  allowEmpty={false}
                  {...props}
               />
            );
         } else if (dataType === 'text') {
            formControl = props => (
               <TextField
                  {...props}
               />
            );
         }

         return (
            <Controller
               control={control}
               name={`filters.${index}.value`}
               rules={{
                  required: true
               }}
               render={formControl}
            />
         )
      },
      [column, allowedValues, control, index]
   );

   // function renderFormControl(name, { value, dataType }) {
   //    if (dataType === 'bool') {
   //       return (
   //          <div className={styles.formControl}>
   //             <BooleanSelect
   //                name={name}
   //                value={value}
   //                onChange={handleChange}
   //             />
   //          </div>
   //       );
   //    }



   //    if (dataType === 'timestamp') {
   //       return (
   //          <div className={styles.formControl}>
   //             <DatePicker
   //                name={name}
   //                value={value}
   //                onChange={handleChange}
   //             />
   //          </div>
   //       );
   //    }

   //    return (
   //       <div className={styles.formControl}>
   //          <TextField
   //             key={value}
   //             name={name}
   //             value={value}
   //             onChange={handleChange}
   //          />
   //       </div>
   //    );
   // }

   function handlePropertyChange(event, field) {
      const value = event.target.value;
      const _column = metadata.find(column => column.ColumnName === value) || null;

      field.onChange(event);
      setColumn(_column);
   }

   return (
      <div className={styles.filter}>
         <div>
            <Controller
               control={control}
               name={`filters.${index}.property`}
               rules={{
                  required: true
               }}
               render={props => (
                  <Select
                     //id="dataset"
                     options={propertyOptions}
                     //errorMessage="Datasett må velges"
                     {...props}
                     onChange={event => handlePropertyChange(event, props.field)}
                  />
               )}
            />
         </div>

         <div>
            {valueFormControl}
         </div>
      </div>
   );
}