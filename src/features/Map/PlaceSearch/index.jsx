import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMap } from "context/MapProvider";
import { useDataset } from "context/DatasetProvider";
import { selectFeature } from "store/slices/mapSlice";
import { zoomToGeoJsonFeature } from "utils/helpers/map";
import { customTheme, customStyles } from "config/react-select";
import { getSearchResult } from "./helpers";
import axios from "axios";
import useDebounce from "hooks/useDebounce";
import AsyncSelect from "react-select/async";
import environment from "config/environment";
import styles from "./PlaceSearch.module.scss";

const MAP_CRS = 3857;

export default function PlaceSearch() {
   const { map } = useMap();
   const { activeDatasetId, datasets } = useDataset();
   const [inputValue, setInputValue] = useState("");
   const [value, setValue] = useState(null);
   const dispatch = useDispatch();

   const loadOptions = useDebounce((query, callback) => {
      const _query = query.replace(/\s+/g, " ").trim();

      if (_query.length >= 3) {
         const url = `${environment.API_BASE_URL}/placesearch/${query}/${MAP_CRS}`;

         axios
            .get(url)
            .then((response) => {
               const result = getSearchResult(
                  response,
                  datasets[activeDatasetId].objects,
                  _query
               );
               callback(result);
            })
            .catch(() => {
               callback([]);
            });
      } else {
         callback([]);
      }
   }, 1000);

   function handleChange(value) {
      setValue(null);

      if (value.properties.objectType === "Forvaltningsobjekt") {
         dispatch(
            selectFeature({
               id: value.id,
               zoom: true,
               featureType: "default",
               datasetId: value.properties.datasetId,
            })
         );
      } else {
         zoomToGeoJsonFeature(map, value, 14);
      }
   }

   return (
      <AsyncSelect
         loadOptions={loadOptions}
         className={styles.select}
         value={value}
         inputValue={inputValue}
         onInputChange={setInputValue}
         onChange={handleChange}
         //cacheOptions
         getOptionValue={(option) => option.id}
         getOptionLabel={(option) => option.properties.name}
         formatOptionLabel={({ properties }) => (
            <div className={styles.customOption}>
               <span>{properties.name}</span>
               <span>
                  {properties.objectType}
                  {properties.municipality && properties.county && (
                     <>
                        , {properties.municipality} ({properties.county})
                     </>
                  )}
               </span>
            </div>
         )}
         placeholder="Søk etter steder"
         noOptionsMessage={() => "Ingen steder funnet"}
         loadingMessage={() => "Leter..."}
         defaultOptions
         theme={customTheme}
         styles={customStyles}
      />
   );
}
