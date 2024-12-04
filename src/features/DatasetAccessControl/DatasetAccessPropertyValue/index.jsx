import { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Select, Tags, TextField } from 'components/Form';
import { isValidOrgNo } from '../helpers';
import { formatOrgNo } from 'utils/helpers/general';
import { useLazyGetOrganizationNameQuery } from 'store/services/api';
import styles from '../DatasetAccessControl.module.scss';

export default function DatasetAccessPropertyValue({ valueIndex, propertyIndex, property }) {
   const { control } = useFormContext();
   const [getOrganizationName] = useLazyGetOrganizationNameQuery();

   const formatTag = useCallback(
      async tag => {
         const formatted = formatOrgNo(tag);
         const orgName = await getOrganizationName(tag).unwrap();

         return orgName !== null ?
            <>
               <span className={styles.orgNo}>{formatted}</span>{orgName}
            </> :
            formatted;
      },
      [getOrganizationName]
   );

   return (
      <div className={styles.row}>
         <div className={styles.cell}>
            <Controller
               control={control}
               name={`accessByProperties.${propertyIndex}.values.${valueIndex}.value`}
               rules={{
                  validate: value => value.trim().length > 0
               }}
               render={({ field, fieldState: { error } }) => (
                  property.AllowedValues === null ?
                     <TextField
                        id={`accessByProperties.${propertyIndex}.values.${valueIndex}.value`}
                        label="Verdi"
                        {...field}
                        error={error}
                        errorMessage="Verdi må fylles ut"
                        className={styles.textField}
                     /> :
                     <Select
                        id={`accessByProperties.${propertyIndex}.values.${valueIndex}.value`}
                        label="Verdi"
                        options={property.AllowedValues.map(value => ({ value, label: value }))}
                        {...field}
                        error={error}
                        errorMessage="Verdi må fylles ut"
                        className={styles.select}
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
               render={({ field, fieldState: { error } }) => (
                  <Tags
                     id={`accessByProperties.${propertyIndex}.values.${valueIndex}.contributors`}
                     placeholder="Legg til organisasjon..."
                     {...field}
                     error={error}
                     errorMessage="Minst én organisasjon må legges til"
                     className={styles.organizations}
                     validator={isValidOrgNo}
                     formatTag={formatTag}
                  />
               )}
            />
         </div>
      </div>
   );
}