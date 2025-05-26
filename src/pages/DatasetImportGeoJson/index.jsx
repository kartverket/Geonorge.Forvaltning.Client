import { useParams } from "react-router-dom";
import { useGetDatasetDefinitionQuery } from "store/services/api";
import { DatasetImportGeoJson as DatasetImportGeoJsonFeature } from "features";

export default function DatasetImportGeoJson() {
   const { id } = useParams();
   const { data: dataset, isSuccess } = useGetDatasetDefinitionQuery(id);

   return isSuccess ? <DatasetImportGeoJsonFeature dataset={dataset} /> : null;
}
