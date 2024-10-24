import { useEffect, useState, useCallback  } from 'react';
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
import { GeometryType } from 'context/MapProvider/helpers/constants';

export default function Feature({ feature }) {

   const dispatch = useDispatch();
   const geomType = feature.getGeometry().getType();

   const user = useSelector(state => state.app.user);

   const properties = getProperties(feature.getProperties());

   const { setValue } = useForm();

   const getTag = useCallback(
      event => {
         const tag = event.tag;

         setValue('tag', tag);
         feature.set('_tag', tag);
         setTag(tag);

      },
      [feature, setValue]
   );

   const coordinates = feature.get('_coordinates');

   let tagInfo = feature.get('_tag');
   const [tag, setTag] = useState(tagInfo); 

   const dataset = useLoaderData();

   useEffect(
      () => {       
            setTag(tagInfo);
      },
      [tagInfo,dispatch]
   );

   const methods = useForm();
   const { handleSubmit } = methods;
   const [updateTag] = useUpdateTagMutation();
   const revalidator = useRevalidator();
   const { showModal } = useModal();

   let displayTag = false;
   if(dataset.definition.Id == environment.TAG_DATASET_ID) {

      const countyGovernors = environment.COUNTY_GOVERNORS;
        
      if(user?.organization == dataset.definition.Organization || countyGovernors.includes(user?.organization))
         displayTag = true;
   }

   function handleChange(value) {

      setTag(value);
      tagInfo = value;
      handleSubmit(async () => {

         try {
            await updateTag({ datasetId: environment.TAG_DATASET_ID, id: properties.id.value, tag: value }).unwrap();

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
            geomType === GeometryType.Point && coordinates ?
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