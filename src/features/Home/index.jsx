import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLoaderData } from 'react-router-dom';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { useRequestAuthorizationMutation } from 'store/services/api';
import { useModal } from 'context/ModalProvider';
import { modalType } from 'components/Modals';
import Spinner from 'components/Spinner';
import Datasets from './Datasets';
import styles from './Home.module.scss';

export default function Home() {
   const datasets = useLoaderData();
   useBreadcrumbs();

   const user = useSelector(state => state.app.user);
   const [request] = useRequestAuthorizationMutation();
   const { showModal } = useModal();
   const [loading, setLoading] = useState(false);
   const [authRequested, setAuthRequested] = useState(false);

   async function requestAuthorization() {
      try {
         setLoading(true);
         await request().unwrap();
         setLoading(false);

         await showModal({
            type: modalType.INFO,
            variant: 'success',
            title: 'Forespørsel sendt',
            body: 'Forespørsel om autorisasjon ble sendt.'
         });

         setAuthRequested(true);
      } catch (error) {
         console.error(error);
         setLoading(false);

         await showModal({
            type: modalType.INFO,
            variant: 'error',
            title: 'Feil',
            body: 'Forespørsel om autorisasjon feilet.'
         });
      }
   }

   return (
      <>
         <heading-text>
            <h1 underline="true">Mine datasett</h1>
         </heading-text>

         <div className="container">
            {
               user.organization !== null ?
                  <Datasets datasets={datasets} /> : (
                     !authRequested ?
                        <>
                           <p>Brukeren din er ikke autorisert for bruk av denne applikasjonen. Be om autorisasjon ved å trykke knappen under.</p>

                           <div className={styles.submit}>
                              <gn-button>
                                 <button onClick={requestAuthorization} disabled={loading}>Send forespørsel</button>
                              </gn-button>
                              {
                                 loading ?
                                    <Spinner style={{ position: 'absolute', top: '2px', right: '-42px' }} /> :
                                    null
                              }
                           </div>
                        </> :
                        <p>Forespørsel om autorisasjon ble sendt. Du vil motta svar om og når autorisasjonen blir godkjent.</p>
                  )
            }
         </div>
      </>
   );
}