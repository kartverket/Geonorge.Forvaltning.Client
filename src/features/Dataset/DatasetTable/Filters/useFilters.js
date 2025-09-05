import { useMemo, useState } from "react";
import { isNil } from "lodash";
import useDebounce from "hooks/useDebounce";
import dayjs from "dayjs";

export default function useFilters(nodes, metadata, options = {}) {
   const [filters, _setFilters] = useState({});

   const setFilters = useDebounce((props) => {
      if (props) {
         _setFilters({
            ...filters,
            [props.name]: { value: props.value, exact: props.exact },
         });
      } else {
         _setFilters({});
      }
   }, options.delay || 500);

   const data = useMemo(() => {
      if (Object.values(filters).every((value) => value === null)) {
         return {
            nodes: [...nodes],
         };
      }

      function getNodeValue(node, columnName) {
         const value = node[columnName];

         if (isNil(value)) {
            return null;
         }

         const dataType =
            metadata.find((data) => data.ColumnName === columnName)?.DataType ||
            "text";

         switch (dataType) {
            case "timestamp":
               return dayjs(value).format("DD.MM.YYYY HH:mm");
            default:
               return value.toString().toLowerCase();
         }
      }

      const filtered = nodes.filter((node) => {
         return Object.entries(filters)
            .filter((entry) => entry[1].value !== null)
            .every((entry) => {
               const nodeValue = getNodeValue(node, entry[0]);

               if (nodeValue === null) {
                  return false;
               }

               const value = entry[1].value.toString().toLowerCase();
               const exact = entry[1].exact;

               return exact ? nodeValue === value : nodeValue.includes(value);
            });
      });

      return {
         nodes: [...filtered],
      };
   }, [filters, nodes, metadata]);

   return {
      data,
      setFilters,
   };
}
