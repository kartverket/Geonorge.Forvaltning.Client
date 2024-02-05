import { useCallback, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { isValidOrgNo } from './helpers';
import { useForm, FormProvider, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { Tags } from 'components/Form';
import { fromDbModel, toDbModel } from './mapper';
import { useSetDatasetAccessMutation } from 'store/services/api';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import { formatOrgNo } from 'utils/helpers/general';
import { getOrganizationName } from 'store/services/loaders';
import Spinner from 'components/Spinner';
import DatasetAccessProperty from './DatasetAccessProperty';
import styles from './DatasetAccessControl.module.scss';

export default function DatasetAccessControl() {
   const dataset = useLoaderData();
   useBreadcrumbs(dataset);

   const methods = useForm({ values: fromDbModel(dataset) });
   const { control, handleSubmit, register } = methods;
   const { fields, append, remove } = useFieldArray({ control, name: 'accessByProperties' });
   const metadata = dataset.ForvaltningsObjektPropertiesMetadata;
   const [loading, setLoading] = useState(false);
   const [setDatasetAccess] = useSetDatasetAccessMutation();
   const { showModal } = useModal();
   const accessControlType = useWatch({ control, name: 'accessControlType' });

   function addProperty() {
      append({ propertyId: '', value: '', contributors: [] });
   }

   function removeProperty(index) {
      remove(index);
   }

   function submit() {
      handleSubmit(async dataset => {
         setLoading(true);
         const payload = toDbModel(dataset);

         try {
            await setDatasetAccess(payload).unwrap();
            setLoading(false);

            await showModal({
               type: modalType.INFO,
               variant: 'success',
               title: 'Tilgangsrettigheter oppdatert',
               body: 'Datasettets tilgangsrettigheter ble oppdatert.'
            });
         } catch (error) {
            console.error(error);
            setLoading(false);

            await showModal({
               type: modalType.INFO,
               variant: 'error',
               title: 'Feil',
               body: 'Datasettets tilgangsrettigheter kunne ikke oppdateres.'
            });
         }
      })();
   }

   const formatTag = useCallback(
      async tag => {
         const formatted = formatOrgNo(tag);
         const orgName = await getOrganizationName(tag);
   
         return orgName !== null ?
            <>
               <span className={styles.orgNo}>{formatted}</span>{orgName}
            </> :
            formatted;
      },
      []
   );

   return (
      <>
         <heading-text>
            <h1 underline="true">Tilganger</h1>
         </heading-text>

         <div className="container">
            <FormProvider {...methods}>
               <div className={styles.heading}>
                  <gn-input>
                     <input
                        id="ac-contributors"
                        type="radio"
                        value="contributors"
                        {...register('accessControlType')}
                     />
                  </gn-input>
                  <label htmlFor="ac-contributors">Bidragsytere med redigeringstilgang</label>
               </div>

               <div className={`panel ${accessControlType !== 'contributors' ? styles.disabled : ''}`}>
                  <gn-label block="">
                     <label htmlFor="contributors">Organisasjon(er)</label>
                  </gn-label>

                  <Controller
                     control={control}
                     name="contributors"
                     render={({ field }) => (
                        <Tags
                           id="contributors"
                           placeholder="Legg til organisasjon..."
                           validator={isValidOrgNo}
                           formatTag={formatTag}
                           className={styles.organizations}
                           {...field}
                        />
                     )}
                  />
               </div>

               <div className={styles.heading}>
                  <gn-input>
                     <input
                        id="ac-properties"
                        type="radio"
                        value="properties"
                        {...register('accessControlType')}
                     />
                  </gn-input>
                  <label htmlFor="ac-properties">Egenskapsbaserte tilgangsrettigheter</label>
               </div>

               <div className={`${styles.properties} ${accessControlType !== 'properties' ? styles.disabled : ''}`}>
                  {
                     fields.length > 0 ?
                        fields.map((field, index) => (
                           <div key={field.id} className="panel">
                              <DatasetAccessProperty
                                 index={index}
                                 metadata={metadata}
                              />

                              <div className={styles.buttons}>
                                 {
                                    index === fields.length - 1 ?
                                       <gn-button>
                                          <button onClick={addProperty} className={styles.addButton}>Legg til egenskap</button>
                                       </gn-button> :
                                       null
                                 }
                                 <gn-button>
                                    <button onClick={() => removeProperty(index)} className={styles.removeButton}>Fjern egenskap</button>
                                 </gn-button>
                              </div>
                           </div>
                        )) :
                        <div className={`panel ${styles.noProperties} ${styles.buttons}`}>
                           <gn-button>
                              <button onClick={addProperty} className={styles.addButton}>Legg til egenskap</button>
                           </gn-button>
                        </div>
                  }
               </div>

               <div className={styles.submit}>
                  <gn-button>
                     <button onClick={submit} disabled={loading}>Oppdater tilganger</button>
                  </gn-button>
                  {
                     loading ?
                        <Spinner style={{ position: 'absolute', top: '2px', right: '-42px' }} /> :
                        null
                  }
               </div>
            </FormProvider>
         </div>
      </>
   );
}