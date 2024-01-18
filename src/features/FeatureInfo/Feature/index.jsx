import { renderProperty } from 'utils/helpers/general';
import { getProperties } from 'utils/helpers/map';
import styles from '../FeatureInfo.module.scss';

export default function Feature({ feature }) {
   const properties = getProperties(feature);
   const coordinates = feature.get('_coordinates');

   return (
      <div>
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
                     <div className={styles.noInput} title={coordinates.join(', ')}>{coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}</div>
                  </div>
               </div> :
               null
         }
      </div>
   );
}