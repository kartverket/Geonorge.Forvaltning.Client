import { useState } from 'react';
import { useSelector } from 'react-redux';
import { renderProperty } from 'utils/helpers/general';
import { getProperties } from 'utils/helpers/map';
import styles from '../FeatureInfo.module.scss';
import { useUpdateTagMutation } from 'store/services/api';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import environment from 'config/environment';

export default function Feature({ feature }) {
   const properties = getProperties(feature.getProperties());
   const coordinates = feature.get('_coordinates');
   const [tag, setTag] = useState(feature.get('_tag')); 

   if(tag === undefined) {
      setTag("Nei");
   }

   const dataset = useLoaderData();
   //console.log(dataset);

   const methods = useForm();
   const { handleSubmit } = methods;
   const [updateTag] = useUpdateTagMutation();
   const revalidator = useRevalidator();
   const { showModal } = useModal();

   

   let displayTag = false;
   if(dataset.definition.Id == environment.TAG_DATASET) {

      const countyGovernors = 
         [
         "974762994",
         "974761645",
         "974764067",
         "974764687",
         "974761319",
         "974763230",
         "967311014",
         "974764350",
         "974762501",
         "974760665"
         ];

      const user = useSelector(state => state.app.user);

      if(user?.organization == dataset.definition.Organization || countyGovernors.includes(user?.organization))
         displayTag = true;
   }

   
   function handleChange(value) {
      setTag(value);
      handleSubmit(async () => {

         try {
            await updateTag({ datasetId: environment.TAG_DATASET, id: properties.id.value, tag: value }).unwrap();

            revalidator.revalidate();

            await showModal({
               type: modalType.INFO,
               variant: 'success',
               title: 'Prioritet oppdatert',
               body: 'Prioritet ble oppdatert.'
            });
         } catch (error) {
            console.error(error);

            await showModal({
               type: modalType.INFO,
               variant: 'error',
               title: 'Feil',
               body: 'Prioritet kunne ikke oppdateres.'
            });
         }
      })();
   }
   return (
      <div className={styles.properties}>
         {
            Object.entries(properties)
               .map(entry => (
                  <div key={entry[0]} className={styles.row}>
                     <div className={styles.label}>{entry[1].name}:</div>
                     <div className={styles.value}>
                        <div className={styles.noInput}>{renderProperty(entry[1])}</div>
                     </div>
                  </div>
               ))
         }
         {
            coordinates ?
               <div className={`${styles.row} ${styles.position}`}>
                  <div className={styles.label}>Posisjon:</div>
                  <div className={styles.value}>
                     <div className={styles.noInput}>{coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}</div>
                  </div>
               </div> :
               null
         }
         {
            displayTag?
            <FormProvider {...methods}>
               <div className={`${styles.row} ${styles.position}`}>
                  <div className={styles.label}>Prioritert:</div>
                  <div className={styles.value}>
                     <div className={styles.noInput}>
                        <input type="radio" name="tag" value="Ja"  defaultChecked={tag === "Ja"}  onChange={() => handleChange('Ja')}></input>Ja
                        <input type="radio" name="tag" value="Nei" defaultChecked={tag === "Nei"} onChange={() => handleChange('Nei')}></input>Nei
                     </div>
                  </div>
               </div> 
               </FormProvider>:
               null
         }
      </div>
   );
}