import { Link, useNavigate } from 'react-router-dom';
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
                                 <td>{dataset.Description || '-'}</td>
                                 <td>{dataset.organizationName}</td>
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