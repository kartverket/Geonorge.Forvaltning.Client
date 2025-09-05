import { useCallback, useLayoutEffect, useState } from "react";
import { PerfectCursor } from "perfect-cursors";

export function useCursor(cb, point) {
   const [pc] = useState(() => new PerfectCursor(cb));

   useLayoutEffect(() => {
      if (point) {
         pc.addPoint(point);
      }

      return () => pc.dispose();
   }, [point, pc]);

   const onPointChange = useCallback((point) => pc.addPoint(point), [pc]);

   return onPointChange;
}
