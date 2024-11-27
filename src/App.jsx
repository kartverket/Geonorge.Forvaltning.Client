import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import AuthProvider from 'context/AuthProvider';
import ModalProvider from 'context/ModalProvider';
import styles from './App.module.scss';
import environment from 'config/environment';

export default function App() {
    const fullscreen = useSelector(state => state.app.fullscreen);

    useEffect(
        () => {
            if (fullscreen) {
                document.body.classList.add('fullscreen');
            } else {
                document.body.classList.remove('fullscreen');
            }
        },
        [fullscreen]
    );

    return (
        <AuthProvider>
            <ModalProvider>
                <div className={styles.app}>
                    <content-container>
                        <main-navigation environment={environment.ENVIRONMENT} />
                        <Outlet />
                        <geonorge-footer version={environment.BUILD_VERSION_NUMBER} />
                    </content-container>
                </div>
            </ModalProvider>
        </AuthProvider>
    );
}
