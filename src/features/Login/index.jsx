import { useAuth } from 'context/AuthProvider';
import styles from './Login.module.scss';

export default function Login() {
   const { signIn } = useAuth()

   // const queryParameters = new URLSearchParams(window.location.search)
   // const error_description = queryParameters.get("error_description")

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
            <div className={styles.error}>
               {/* {error_description} */}
            </div>
         </div>
      </div>
   );
}