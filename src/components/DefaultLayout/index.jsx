import Breadcrumbs from "features/Breadcrumbs";
import styles from "./DefaultLayout.module.scss";

export default function DefaultLayout({ children }) {
   return (
      <div className={styles.layout}>
         <div className={`${styles.top} default-layout-top`}>
            <Breadcrumbs />
         </div>

         {children}
      </div>
   );
}
