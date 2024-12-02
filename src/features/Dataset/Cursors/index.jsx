import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMap } from 'context/MapProvider';
import { useDataset } from 'context/DatasetProvider';
import { containsXY } from 'ol/extent';
import { isEmpty } from 'lodash';
import Cursor from './Cursor';

export default function Cursors() {
    const { map } = useMap();
    const { definition } = useDataset();
    const pointerPositions = useSelector(state => state.map.pointerPositions);

    const cursors = useMemo(
        () => {
            if (isEmpty(pointerPositions) || map?.getView().getCenter() === undefined) {
                return null;
            }

            const extent = map.getView().calculateExtent(map.getSize());

            return Object.values(pointerPositions)
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
        [map, pointerPositions, definition.Id]
    );

    return cursors;
}