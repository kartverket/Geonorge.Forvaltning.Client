import { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useMap } from 'context/MapProvider';
import { containsXY } from 'ol/extent';
import colorsGenerator from 'colors-generator';
import Cursor from 'components/Cursor';

export default function Cursors() {
    const { map } = useMap();
    const connectedUsers = useSelector(state => state.app.connectedUsers);
    const colorsRef = useRef(generateColors());

    const cursors = useMemo(
        () => {
            if (map?.getView().getCenter() === undefined) {
                return null;
            }

            const extent = map.getView().calculateExtent(map.getSize());

            return Object.values(connectedUsers)
                .filter(value => containsXY(extent, ...value.coordinate))
                .map(value => {
                    const colorsMap = colorsRef.current;
                    let [color] = [...colorsMap.entries()].find(entry => entry[1] === value.connectionId) || [];

                    if (!color) {
                        [color] = [...colorsMap.entries()].find(entry => entry[1] === null) || [];
                        colorsRef.current.set(color, value.connectionId);
                    }

                    const [x, y] = map.getPixelFromCoordinate(value.coordinate);

                    return (
                        <Cursor
                            key={value.connectionId}
                            username={value.username}
                            point={[Math.round(x), Math.round(y)]}
                            color={color}
                        />
                    );
                });
        },
        [map, connectedUsers]
    );

    function generateColors() {
        const colors = colorsGenerator.generate('#86bff2', 10).darker(0.2).get();
        return new Map(colors.map(color => [color, null]));
    }

    return cursors;
}