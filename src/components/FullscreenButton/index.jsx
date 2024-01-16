import { useState } from 'react';
import styles from './FullscreenButton.module.scss';

export default function FullscreenButton() {
   const [fullscreen, setFullscreen] = useState(false);

   function toggleFullscreen() {
      setFullscreen(!fullscreen);
      document.body.classList.toggle('fullscreen');
   }

   return (
      <button 
         onClick={toggleFullscreen} 
         className={`${styles.fullscreenButton} ${fullscreen ? styles.fullscreen : ''}`}
         title={!fullscreen ? 'Aktiver fullskjerm' : 'Deaktiver fullskjerm'}
      >
      </button>
   );
}