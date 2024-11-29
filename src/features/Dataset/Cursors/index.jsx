import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMap } from 'context/MapProvider';
import { useDataset } from 'context/DatasetProvider';
import { containsXY } from 'ol/extent';
import { isEmpty } from 'lodash';
import Cursor from 'components/Cursor';

export default function Cursors() {
    const { map } = useMap();
    const { definition } = useDataset();
    const connectedUsers = useSelector(state => state.app.connectedUsers);

    const cursors = useMemo(
        () => {
            if (isEmpty(connectedUsers) || map?.getView().getCenter() === undefined) {
                return null;
            }

            const extent = map.getView().calculateExtent(map.getSize());

            return Object.values(connectedUsers)
                .filter(value => value.datasetId === definition.Id && containsXY(extent, ...value.coordinate))
                .map(value => {
                    const [x, y] = map.getPixelFromCoordinate(value.coordinate);

                    return (
                        <Cursor
                            key={value.connectionId}
                            username={value.username}
                            point={[Math.round(x), Math.round(y)]}
                            color={value.color}
                        />
                    );
                });
        },
        [map, connectedUsers, definition.Id]
    );

    return cursors;
}