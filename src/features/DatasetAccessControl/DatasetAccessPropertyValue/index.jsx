import { Controller, useFormContext } from 'react-hook-form';
import { Select, Tags, TextField } from 'components/Form/Controllers';
import { isValidOrgNo } from '../helpers';
import { formatOrgNo } from 'utils/helpers/general';
import styles from '../DatasetAccessControl.module.scss';

export default function DatasetAccessPropertyValue({ valueIndex, propertyIndex, property }) {
   const { control } = useFormContext();

   return (
      <div className={styles.row}>
         <div className={styles.cell}>
            <Controller
               control={control}
               name={`accessByProperties.${propertyIndex}.values.${valueIndex}.value`}
               rules={{
                  validate: value => value.trim().length > 0
               }}
               render={props => (
                  property.AllowedValues === null ?
                     <TextField
                        id={`accessByProperties.${propertyIndex}.values.${valueIndex}.value`}
                        label="Verdi"
                        errorMessage="Verdi må fylles ut"
                        className={styles.textField}
                        {...props}
                     /> :
                     <Select
                        id={`accessByProperties.${propertyIndex}.values.${valueIndex}.value`}
                        label="Verdi"
                        options={property.AllowedValues.map(value => ({ value, label: value }))}
                        errorMessage="Verdi må fylles ut"
                        className={styles.select}
                        {...props}
                     />
               )}
            />
         </div>
         <div className={styles.cell}>
            <gn-label block="">
               <label htmlFor={`accessByProperties.${propertyIndex}.values.${valueIndex}.contributors`}>Organisasjon(er)</label>
            </gn-label>

            <Controller
               control={control}
               name={`accessByProperties.${propertyIndex}.values.${valueIndex}.contributors`}
               rules={{
                  required: true
               }}
               render={props => (
                  <Tags
                     id={`accessByProperties.${propertyIndex}.values.${valueIndex}.contributors`}
                     placeholder="Legg til organisasjon..."
                     errorMessage="Minst én organisasjon må legges til"
                     className={styles.organizations}
                     validator={isValidOrgNo}
                     formatTag={formatOrgNo}
                     {...props}                     
                  />
               )}
            />
         </div>
      </div>
   );
}