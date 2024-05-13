import { useEffect, useState,useRef, useCallback  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { renderProperty } from 'utils/helpers/general';
import { getProperties } from 'utils/helpers/map';
import styles from '../FeatureInfo.module.scss';
import { useUpdateTagMutation } from 'store/services/api';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import environment from 'config/environment';
import { updateDataObject } from 'store/slices/objectSlice';

export default function Feature({ feature }) {

   const dispatch = useDispatch();

   const user = useSelector(state => state.app.user);

   const properties = getProperties(feature.getProperties());

   const { setValue } = useForm();

   const getTag = useCallback(
      event => {
         const tag = event.tag;
         tagInfo = tag;

         setValue('tag', tag);
         feature.set('_tag', tag);
         setTag(tag);

      },
      [feature, setValue]
   );

   const coordinates = feature.get('_coordinates');

   let tagInfo = feature.get('_tag');
   const [tag, setTag] = useState(tagInfo); 
   const tagRef = useRef(tag);

   const dataset = useLoaderData();

   useEffect(
      () => {
         
            tagRef.current = tagInfo;
            setTag(tagInfo);

      },
      [tagRef, tagInfo,dispatch]
   );

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
         "974760665",
         "921627009",
         ];

      if(user?.organization == dataset.definition.Organization || countyGovernors.includes(user?.organization))
         displayTag = true;
   }

   function handleChange(value) {

      setTag(value);
      tagInfo = value;
      handleSubmit(async () => {

         try {
            await updateTag({ datasetId: environment.TAG_DATASET, id: properties.id.value, tag: value }).unwrap();

            revalidator.revalidate();

            const payload = { tag: value };

            dispatch(updateDataObject({ id: properties.id.value, properties: payload }));

            await showModal({
               type: modalType.INFO,
               variant: 'success',
               title: 'Prioritet oppdatert',
               body: 'Prioritet ble oppdatert.'
            });

            getTag({ tag: value });

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
                        <input type="radio" checked={tag == "Ja"} name="tag"  id="tagJa" value="Ja" onChange={() => handleChange('Ja')}></input>Ja
                        <input type="radio" checked={tag == "Nei"}  name="tag"  id="tagNei" value="Nei" onChange={() => handleChange('Nei')}></input>Nei
                     </div>
                  </div>
               </div>
               </FormProvider>:
               null
         }
      </div>
   );

}