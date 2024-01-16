import styles from './Spinner.module.scss';

export default function Spinner({ style }) {
   return (
      <div className={styles.spinner} style={style}></div>
   );
}