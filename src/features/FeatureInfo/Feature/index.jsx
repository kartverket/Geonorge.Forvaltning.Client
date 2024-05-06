import { useState } from 'react';
import { renderProperty } from 'utils/helpers/general';
import { getProperties } from 'utils/helpers/map';
import styles from '../FeatureInfo.module.scss';
import { useUpdateTagMutation } from 'store/services/api';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';

export default function Feature({ feature }) {
   const properties = getProperties(feature.getProperties());
   const coordinates = feature.get('_coordinates');
   const [tag, setTag] = useState(feature.get('_tag')); //todo set tag from api
   if(tag === undefined) {
      setTag("Nei");
   }
   console.log(tag);
   console.log(feature);
   const dataset = useLoaderData();

   const [loading, setLoading] = useState(false);
   const methods = useForm();
   const { handleSubmit } = methods;
   const [updateTag] = useUpdateTagMutation();
   const revalidator = useRevalidator();
   const { showModal } = useModal();

   

   let displayTag = true; //todo only true for datasetId = X  and (owner = true or in list of statsforvalters)

   
   function handleChange(value) {
      console.log(value);
      setTag(value);
      //feature.set('_tag', value);
      handleSubmit(async dataset => {
         setLoading(true);
         //const payload = toDbModel(dataset);

         try {
            await updateTag({ datasetId: 42, id: 60627, tag: value }).unwrap();
            setLoading(false);

            revalidator.revalidate();

            await showModal({
               type: modalType.INFO,
               variant: 'success',
               title: 'Prioritet oppdatert',
               body: 'Prioritet ble oppdatert.'
            });
         } catch (error) {
            console.error(error);
            setLoading(false);

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