import { useCallback, useLayoutEffect, useRef } from 'react';
import { useCursor } from 'hooks/useCursor';
import MouseCursor from 'assets/gfx/mouse-cursor.svg?react';
import styles from './Cursor.module.scss';

export default function Cursor({ point, username, color }) {
    const cursorRef = useRef(null)

    const animateCursor = useCallback(
        point => {
            const element = cursorRef.current;

            if (element !== null) {
                element.style.setProperty('transform', `translate(${point[0]}px, ${point[1]}px)`);
            }
        },
        []
    );

    const onPointMove = useCursor(animateCursor);

    useLayoutEffect(() => onPointMove(point), [onPointMove, point]);

    return (
        <div
            ref={cursorRef}
            className={styles.cursor}
        >
            <MouseCursor fill={color} width="28px" height="28px" />
            <div className={styles.username} style={{ backgroundColor: color }}>{username}</div>
        </div>
    );
}