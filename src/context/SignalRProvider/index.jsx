import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { setConnectionId } from 'store/slices/appSlice';

const SIGNAL_R_HUB_URL = import.meta.env.VITE_SIGNAL_R_HUB_URL;

export default function SignalRProvider({ messageHandlers, children }) {
    const [connection, setConnection] = useState(null);
    const connectionId = useSelector(state => state.app.connectionId);
    const dispatch = useDispatch();

    useEffect(
        () => {
            const newConnection = new HubConnectionBuilder()
                .withUrl(SIGNAL_R_HUB_URL)
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: () => 5000
                })
                .build();

            newConnection.onreconnected(connectionId => {
                dispatch(setConnectionId(connectionId));
            });

            setConnection(newConnection);
        },
        [dispatch]
    );

    useEffect(
        () => {
            if (!connection || connection.state !== 'Disconnected') {
                return;
            }

            async function connect() {
                try {
                    await connection.start();
                    dispatch(setConnectionId(connection.connectionId));

                    [...messageHandlers.keys()].forEach(key => {
                        connection.on(key, messageHandlers.get(key));
                    });
                } catch (error) {
                    console.error('SignalR connection failed: ', error);
                }
            }

            connect();
        },
        [connection, dispatch]
    );

    const send = useCallback(
        async (method, message) => {
            console.log(connectionId);
            await connection.send(method, connectionId, message);
        },
        [connection, connectionId]
    );

    return (
        <SignalRContext.Provider value={{ connectionId, send }}>
            {children}
        </SignalRContext.Provider>
    );
}

export const SignalRContext = createContext({});
export const useSignalR = () => useContext(SignalRContext);