import { api } from "store/services/api";

function DatasetQuery({ id }) {
   api.useGetDatasetQuery(id, {
      refetchOnFocus: true,
      refetchOnReconnect: true,
   });
   return null;
}

export default function DatasetSubscriptions({ ids }) {
   return (
      <>
         {ids.map((id) => (
            <DatasetQuery key={id} id={id} />
         ))}
      </>
   );
}
