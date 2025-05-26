import { useSelector } from 'react-redux';
import RequestAuthorization from './RequestAuthorization';

export default function Home({ datasets }) {
    const user = useSelector(state => state.app.user);

    return (
        user !== null && user.organization === null ? <RequestAuthorization /> : <div>Placeholder for map. Number of datasets: {datasets.length}</div>
    );
}