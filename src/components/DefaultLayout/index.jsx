import { useSelector } from 'react-redux';
import { useAuth } from 'context/AuthProvider';
import { Menu, MenuItem } from '@szhsin/react-menu';
import Breadcrumbs from 'features/Breadcrumbs';
import styles from './DefaultLayout.module.scss';

export default function DefaultLayout({ children }) {
   const { signOut } = useAuth();
   const user = useSelector(state => state.app.user);

   return (
      <div className={styles.layout}>
         <div className={`${styles.top} default-layout-top`}>
            <Breadcrumbs />
            {
               user && (
                  <Menu
                     menuButton={<button className={`buttonLink ${styles.userButton}`}>{user.name}</button>}
                     align="end"
                     arrow={true}
                     className={styles.userMenu}
                  >
                     <li className={styles.userInfo}>
                        {user.email}<br />
                        <span>{user.organizationName}</span>
                     </li>
                     <MenuItem onClick={signOut}>Logg ut</MenuItem>
                  </Menu>
               )
            }
         </div>

         {children}
      </div>
   );
}