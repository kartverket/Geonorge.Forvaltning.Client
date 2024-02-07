import styles from './Spinner.module.scss';

export default function Spinner({ style, className = '' }) {
   return (
      <div className={`${styles.spinner} ${className}`} style={style}></div>
   );
}