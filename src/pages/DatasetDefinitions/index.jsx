import { useParams } from "react-router-dom";
import { useGetDatasetDefinitionQuery } from "store/services/api";
import { DatasetDefinitions as DatasetDefinitionsFeature } from "features";

export default function DatasetDefinitions() {
   const { id } = useParams();
   const { data: dataset, isSuccess } = useGetDatasetDefinitionQuery(id);

   return isSuccess ? <DatasetDefinitionsFeature dataset={dataset} /> : null;
}
