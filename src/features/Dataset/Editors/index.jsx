import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSignalR } from 'context/SignalRProvider';
import styles from './Editors.module.scss';

export default function Editors({ datasetId }) {
    const { connectionId } = useSignalR();
    const editedDataObjects = useSelector(state => state.object.editedDataObjects);

    const dataObjects = useMemo(
        () => {
            return editedDataObjects
                .filter(object => object.connectionId !== connectionId && object.datasetId === datasetId);
        },
        [editedDataObjects, connectionId, datasetId]
    );

    if (dataObjects.length === 0) {
        return null;
    }

    return (
        <div className={styles.editors}>
            {
                dataObjects.map(object => (
                    <div
                        key={object.connectionId}
                        title={`Datasettet redigeres av ${object.username}`}
                        className={styles.editor}
                        style={{ backgroundColor: object.color }}
                    >
                        {object.username}
                    </div>
                ))
            }
        </div>
    );
}