import { useParams } from "react-router-dom";
import { useGetDatasetDefinitionQuery } from "store/services/api";
import { DatasetImportCsv as DatasetImportCsvFeature } from "features";

export default function DatasetImportCsv() {
   const { id } = useParams();
   const { data: dataset, isSuccess } = useGetDatasetDefinitionQuery(id);

   return isSuccess ? <DatasetImportCsvFeature dataset={dataset} /> : null;
}
