import {
   forwardRef,
   useCallback,
   useEffect,
   useImperativeHandle,
   useMemo,
   useRef,
   useState,
} from "react";
import { queryEnhetsregisteretByNavn } from "utils/brreg";
import styles from "./AutocompleteLookup.module.scss";

const MIN_CHARS = 3;
const DEBOUNCE_DELAY = 300;
const MAX_RESULTS = 5;

const AutocompleteLookup = forwardRef(({ query, onSelect, inputRef }, ref) => {
   const [results, setResults] = useState([]);
   const [open, setOpen] = useState(false);
   const [activeItemIndex, setActiveItemIndex] = useState(0);
   const [error, setError] = useState(null);

   const dropdownRef = useRef(null);

   const fetchSuggestions = useCallback(async (query) => {
      if (query.length < MIN_CHARS) {
         setError(null);
         setOpen(false);
         setResults([]);
         return;
      }

      try {
         const items = await queryEnhetsregisteretByNavn(query, MAX_RESULTS);

         setActiveItemIndex(0);
         setError(null);
         setOpen(true);
         setResults(items);
      } catch (err) {
         setActiveItemIndex(-1);
         setError("Ingen kontakt med registeret");
         setOpen(true);
      }
   }, []);

   const debouncedFetch = useMemo(() => {
      let timer;

      return (q) => {
         clearTimeout(timer);
         timer = setTimeout(() => fetchSuggestions(q), DEBOUNCE_DELAY);
      };
   }, [fetchSuggestions]);

   useEffect(() => {
      setActiveItemIndex(0);
      debouncedFetch(query);
   }, [query, debouncedFetch]);

   useEffect(() => {
      const handleClick = (event) => {
         const target = event.target;

         const clickedInsideDropdown =
            dropdownRef.current && dropdownRef.current.contains(target);

         const clickedInsideAnchor =
            inputRef.current && inputRef.current.contains(target);

         setOpen(
            clickedInsideDropdown ||
               (clickedInsideAnchor && query.length >= MIN_CHARS)
         );
      };

      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
   }, [inputRef, query.length]);

   const handleSelectItem = (organisasjonsnummer) => {
      onSelect(organisasjonsnummer);
      setOpen(false);
   };

   const stepThroughItems = (dir) => {
      setActiveItemIndex((i) =>
         results.length === 0 ? -1 : (i + dir + results.length) % results.length
      );
   };

   const commitItemSelect = () => {
      if (activeItemIndex === -1) return;
      handleSelectItem(results[activeItemIndex].organisasjonsnummer);
   };

   useImperativeHandle(ref, () => ({
      onKeyDown: (event) => {
         if (!open && ["ArrowDown", "ArrowUp"].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
            setActiveItemIndex(0);
            return;
         }

         switch (event.key) {
            case "Escape":
               setOpen(false);
               break;
            case "ArrowDown":
               event.preventDefault();
               stepThroughItems(1);
               break;
            case "ArrowUp":
               event.preventDefault();
               stepThroughItems(-1);
               break;
            case "Enter":
               event.preventDefault();
               commitItemSelect();
               break;
         }
      },
   }));

   return (
      <>
         {open && (
            <ul ref={dropdownRef} className={styles.list}>
               {error && <li className={styles.error}>{error}</li>}

               {!error && query.length > MIN_CHARS && results.length === 0 && (
                  <li className={styles.noResults}>Ingen treff</li>
               )}

               {results.map((result, index) => (
                  <li
                     key={result.organisasjonsnummer}
                     id={result.organisasjonsnummer}
                     className={`${styles.item} ${
                        activeItemIndex === index ? styles.active : ""
                     }`}
                     onMouseEnter={() => {
                        setActiveItemIndex(index);
                     }}
                     onMouseDown={() =>
                        handleSelectItem(result.organisasjonsnummer)
                     }
                  >
                     {result.navn}
                  </li>
               ))}
            </ul>
         )}
      </>
   );
});

export default AutocompleteLookup;
