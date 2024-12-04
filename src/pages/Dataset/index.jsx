import { useDispatch } from 'react-redux';
import { useBlocker, useParams } from 'react-router-dom';
import { useGetDatasetQuery } from 'store/services/api';
import { useSignalR } from 'context/SignalRProvider';
import { toggleFullscreen } from 'store/slices/appSlice';
import { setPointerPositions } from 'store/slices/mapSlice';
import { messageType } from 'config/messageHandlers';
import { DefaultLayout } from 'components';
import { Dataset as DatasetFeature } from 'features';

export default function Dataset() {
    const { id } = useParams();
    const { data: dataset, isSuccess } = useGetDatasetQuery(id);
    const { send } = useSignalR();
    const dispatch = useDispatch();

    useBlocker(({ currentLocation, nextLocation }) => {
        if (currentLocation.pathname !== nextLocation.pathname) {
            dispatch(toggleFullscreen(false));
            dispatch(setPointerPositions(null));            
            send(messageType.SendPointerMoved, {});
        }

        return false;
    });

    return (
        <DefaultLayout>
            {isSuccess ? <DatasetFeature dataset={dataset} /> : null}
        </DefaultLayout>
    );
}