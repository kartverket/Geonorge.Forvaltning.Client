import { useState, useMemo } from "react";
import { getTableStyle } from "../helpers";
import { BooleanSelect, Select, TextField } from "components/Form";
import styles from "./Filters.module.scss";

export default function Filters({ definition, onChange }) {
   const [state, setState] = useState(getDefaultState());
   const filterStyle = useMemo(() => getTableStyle(definition), [definition]);

   function handleChange(event, exact = false) {
      const { name, value } = event.target;
      const newValue = value !== "" ? value : null;

      setState({ ...state, [name]: newValue });
      onChange({ name, value: newValue, exact });
   }

   function renderFilter(name, dataType, allowedValues) {
      if (dataType === "bool") {
         return (
            <BooleanSelect
               name={name}
               value={state[name]}
               onChange={(event) => handleChange(event, true)}
            />
         );
      }

      if (dataType === "text" && allowedValues?.length) {
         const options = allowedValues.map((value) => ({
            value,
            label: value,
         }));

         return (
            <Select
               name={name}
               value={state[name]}
               options={options}
               onChange={(event) => handleChange(event, true)}
            />
         );
      }

      return (
         <TextField
            name={name}
            value={state[name]}
            onChange={handleChange}
            type={dataType}
         />
      );
   }

   function getDefaultState() {
      const state = {
         id: "",
      };

      definition.ForvaltningsObjektPropertiesMetadata.forEach(
         (metadata) => (state[metadata.ColumnName] = "")
      );

      return state;
   }

   function handleEmpty() {
      setState({ ...getDefaultState() });
      onChange(null);
   }

   return (
      <div className={styles.filters} style={filterStyle}>
         <div>{renderFilter("id", "number")}</div>
         {definition.ForvaltningsObjektPropertiesMetadata.map((metadata) => (
            <div key={metadata.ColumnName}>
               {renderFilter(
                  metadata.ColumnName,
                  metadata.DataType,
                  metadata.AllowedValues
               )}
            </div>
         ))}
         <div>
            <gn-button>
               <button onClick={handleEmpty}>Tøm</button>
            </gn-button>
         </div>
      </div>
   );
}
