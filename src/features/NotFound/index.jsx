import { Link } from 'react-router-dom';
import styles from './NotFound.module.scss';

export default function NotFound() {
   return (
      <>
         <heading-text>
            <h1 underline="true">404 - side ikke funnet</h1>
         </heading-text>

         <div className="container">
            <div className={styles.text}>Siden du ser etter ble dessverre ikke funnet.</div>

            <gn-button color="default">
               <Link to="/">Gå til forside</Link>
            </gn-button>
         </div>
      </>
   );
}