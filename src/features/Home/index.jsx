import { useSelector } from 'react-redux';
import Datasets from './Datasets';
import RequestAuthorization from './RequestAuthorization';

export default function Home({ datasets }) {
    const user = useSelector(state => state.app.user);

    function renderContents() {
        if (user === null) {
            return null;
        }

        if (user.organization !== null) {
            return <Datasets datasets={datasets} />
        }

        return <RequestAuthorization />
    }

    return (
        <>
            <heading-text>
                <h1 underline="true">Mine datasett</h1>
            </heading-text>

            <div className="container">
                {renderContents()}
            </div>
        </>
    );
}