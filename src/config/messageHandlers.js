import store from 'store';
import { setConnectedUsers } from 'store/slices/appSlice';

export const messageType = {
    ReceiveMessage: 'ReceiveMessage',
    SendMessage: 'SendMessage'
};

const messageHandlers = new Map();

messageHandlers.set(messageType.ReceiveMessage, message => {
    store.dispatch(setConnectedUsers(message));
});

export default messageHandlers;