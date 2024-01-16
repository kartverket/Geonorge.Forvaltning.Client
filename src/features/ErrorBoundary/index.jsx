import { useNavigate, useRouteError } from 'react-router-dom';
import styles from './ErrorBoundary.module.scss';

export default function ErrorBoundary() {
   const error = useRouteError();
   const navigate = useNavigate();

   return (
      <>
         <heading-text>
            <h1 underline="true">En feil har oppstått</h1>
         </heading-text>
         <body-text>
            <div className={styles.container}>
               <div className={styles.error}>
                  {
                     error.stack ?
                        <div className={styles.stack}>{error.stack}</div> :
                        <code>
                           <pre>{JSON.stringify(error, null, 3)}</pre>
                        </code>
                  }
               </div>

               <gn-button>
                  <button onClick={() => navigate(-1)}>Tilbake</button>
               </gn-button>
            </div>
         </body-text>
      </>
   )
}