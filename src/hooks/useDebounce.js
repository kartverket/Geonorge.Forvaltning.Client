import { useEffect, useRef } from "react";

export default function useDebounce(callback, delay) {
   const timeoutRef = useRef(null);

   useEffect(() => {
      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, []);

   function debouncedCallback(...args) {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
         callback(...args);
      }, delay);
   }

   return debouncedCallback;
}
