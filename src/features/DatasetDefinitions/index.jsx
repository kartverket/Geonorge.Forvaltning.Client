import { useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { useUpdateDatasetMutation } from 'store/services/api';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import { fromDbModel, toDbModel } from 'features/DatasetNew/mapper';
import DatasetForm from 'features/DatasetNew/DatasetForm';
import Spinner from 'components/Spinner';
import styles from './DatasetDefinitions.module.scss';

export default function DatasetDefinitions() {
   const dataset = useLoaderData();
   useBreadcrumbs(dataset);
   const [loading, setLoading] = useState(false);
   const methods = useForm({ defaultValues: fromDbModel(dataset) });
   const { handleSubmit } = methods;
   const [updateDataset] = useUpdateDatasetMutation();
   const revalidator = useRevalidator();
   const { showModal } = useModal();

   function submit() {
      handleSubmit(async dataset => {
         setLoading(true);
         const payload = toDbModel(dataset);

         try {
            await updateDataset({ id: dataset.id, dataset: payload }).unwrap();
            setLoading(false);

            revalidator.revalidate();

            await showModal({
               type: modalType.INFO,
               variant: 'success',
               title: 'Datasett oppdatert',
               body: 'Datasettet ble oppdatert.'
            });
         } catch (error) {
            console.error(error);
            setLoading(false);

            await showModal({
               type: modalType.INFO,
               variant: 'error',
               title: 'Feil',
               body: 'Datasettet kunne ikke oppdateres.'
            });
         }
      })();
   }

   return (
      <>
         <heading-text>
            <h1 underline="true">Rediger definisjoner</h1>
         </heading-text>

         <div className="container">
            <FormProvider {...methods}>
               <DatasetForm />

               <div className={styles.submit}>
                  <gn-button>
                     <button onClick={submit} disabled={loading}>Oppdater datasett</button>
                  </gn-button>
                  {
                     loading && <Spinner style={{ position: 'absolute', top: '2px', right: '-42px' }} />
                  }
               </div>
            </FormProvider>
         </div>
      </>
   );
}