import { Link, useNavigate } from 'react-router-dom';
import { formatOrgNo } from 'utils/helpers/general';
import styles from '../Home.module.scss';

export default function Datasets({ datasets }) {
   const navigate = useNavigate();

   return (
      <>
         {
            datasets.length > 0 ?
               <gn-table hoverable="">
                  <table className={styles.datasets}>
                     <thead>
                        <tr>
                           <th>Navn</th>
                           <th>Beskrivelse</th>
                           <th>Eier</th>
                        </tr>
                     </thead>
                     <tbody>
                        {
                           datasets.map(dataset => (
                              <tr key={dataset.Id} onClick={() => navigate(`/datasett/${dataset.Id}`)}>
                                 <td>{dataset.Name}</td>
                                 <td className={styles.description}>{dataset.Description || '-'}</td>
                                 <td>{formatOrgNo(dataset.Organization)}</td>
                              </tr>
                           ))
                        }
                     </tbody>
                  </table>
               </gn-table> :
               null
         }

         <div className={styles.addButton}>
            <gn-button color="default">
               <Link to="/datasett/nytt">Legg til datasett</Link>
            </gn-button>
         </div>
      </>
   );
}