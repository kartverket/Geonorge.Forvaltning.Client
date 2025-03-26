import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from 'context/AuthProvider';
import styles from './Login.module.scss';
import Cookies from 'js-cookie';

export default function Login() {
   const { signIn } = useAuth()
   const [searchParams] = useSearchParams();

   let loggedInOtherApp = Cookies.get('_loggedIn') ? Cookies.get('_loggedIn') : 'false';

   if(loggedInOtherApp === 'true') {
      signIn();
   }

   const error = useMemo(
      () => {
         const errorMessage = searchParams.get('error');
         history.replaceState('', document.title, window.location.pathname);

         return errorMessage;
      },
      [searchParams]
   );

   return (
      <div className={styles.container}>
         <div className={styles.login}>
            <heading-text>
               <h1 underline="true">Geonorge Forvaltning</h1>
            </heading-text>

            <div className={styles.button}>
               <gn-button>
                  <button onClick={signIn}>Logg inn</button>
               </gn-button>
            </div>
         </div>

         {
            error && (
               <div className={`panel ${styles.error}`}>
                  Feil: {error}
               </div>
            )
         }
      </div>
   );
}