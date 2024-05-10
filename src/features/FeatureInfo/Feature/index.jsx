import { useEffect, useState,useRef  } from 'react';
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
   const user = useSelector(state => state.app.user);
   console.log(feature);

   const properties = getProperties(feature.getProperties());

   Object.entries(properties)
   .map(entry => (
      console.log(renderProperty(entry[1])) 
   ))

   const coordinates = feature.get('_coordinates');
   //const selected = feature.get('_selected');
   //console.log(selected);
   let tagInfo = feature.get('_tag');
   console.log("Getfeature:" +tagInfo);
   //console.log(coordinates[1].toFixed(6) +","+ coordinates[0].toFixed(6));
   const [tag, setTag] = useState(tagInfo); 
   const tagRef = useRef(tag);

   console.log("TagRef:"+tagRef.current);

   const dataset = useLoaderData();
   //console.log(dataset);

   //setTag(tagInfo);
   useEffect(
      () => {

         //setTimeout(() => {
            
            console.log("Tag changed to:" +tagInfo);
            tagRef.current = tagInfo;
            setTag(tagInfo);

          //}, 2000);
      },
      [tagRef, tagInfo]
   );

   const methods = useForm();
   const { handleSubmit } = methods;
   const [updateTag] = useUpdateTagMutation();
   const revalidator = useRevalidator();
   const { showModal } = useModal();

   console.log("Tag:"+tag);

   function refreshPage() {
      setTimeout(()=>{
          window.location.reload(false);
      }, 500);
      console.log('page to reload')
  }

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
      console.log("Change checked to:" +value);

      //setTimeout(() => {
            
      setTag(value);

      // }, 2000);

      tagInfo = value;
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

            //refreshPage();

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
                     {console.log("jepp")}
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
                        <input type="radio" name="tag" value="Ja"  checked={tag == "Ja"}  onChange={() => handleChange('Ja')}></input>Ja
                        <input type="radio" name="tag" value="Nei" checked={tag == "Nei"} onChange={() => handleChange('Nei')}></input>Nei
                     </div>
                  </div>
               </div> 
               </FormProvider>:
               null
         }
      </div>
   );
}