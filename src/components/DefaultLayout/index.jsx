import { useSelector } from 'react-redux';
import { useAuth } from 'context/AuthProvider';
import { Menu, MenuItem } from '@szhsin/react-menu';
import Breadcrumbs from 'features/Breadcrumbs';
import styles from './DefaultLayout.module.scss';
import Cookies from 'js-cookie';

export default function DefaultLayout({ children }) {
   const { signOut } = useAuth();
   const user = useSelector(state => state.app.user);

   function handleSignOut() {

      if (isLocalhost) 
         Cookies.set('_loggedIn', 'false');
      else
         Cookies.set('_loggedIn', 'false', { domain: 'geonorge.no' });

      signOut();
   }

   const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
          /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

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
                     <MenuItem onClick={handleSignOut}>Logg ut</MenuItem>
                  </Menu>
               )
            }
         </div>

         {children}
      </div>
   );
}