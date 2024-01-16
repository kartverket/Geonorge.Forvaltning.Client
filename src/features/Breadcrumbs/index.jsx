import { useEffect } from 'react';
import { useMatches, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setBreadcrumbs } from 'store/slices/appSlice';
import styles from './Breadcrumbs.module.scss';

export default function Breadcrumbs() {
   const breadcrumbs = useSelector(state => state.app.breadcrumbs);

   return (
      <div className={styles.breadcrumbs}>
         {
            breadcrumbs.length ?
               <ul>
                  {
                     breadcrumbs.map((crumb, index) => (
                        <li key={index}>
                           {
                              index !== breadcrumbs.length - 1 ?
                                 <Link to={crumb.path}>{crumb.name}</Link> :
                                 crumb.name
                           }
                        </li>
                     ))
                  }
               </ul> :
               null
         }
      </div>
   );
}

export function useBreadcrumbs(data) {
   const matches = useMatches();
   const dispatch = useDispatch();

   useEffect(
      () => {
         const crumbData = matches
            .filter((match) => Boolean(match.handle?.pageName))
            .map((match) => ({
               path: match.pathname,
               name: match.handle.pageName(data)
            }));

         const title = crumbData
            .map(crumb => crumb.name)
            .toReversed()
            .join(' | ');

         document.title = `${title} | Geonorge Forvaltning`;

         dispatch(setBreadcrumbs(crumbData));
      },
      [matches, dispatch, data]
   );
}