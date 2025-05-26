import { useParams } from "react-router-dom";
import { useGetDatasetDefinitionQuery } from "store/services/api";
import { DatasetAccessControl as DatasetAccessControlFeature } from "features";

export default function DatasetAccessControl() {
   const { id } = useParams();
   const { data: dataset, isSuccess } = useGetDatasetDefinitionQuery(id);

   return isSuccess ? <DatasetAccessControlFeature dataset={dataset} /> : null;
}
