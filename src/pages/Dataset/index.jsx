import { useParams } from 'react-router-dom';
import { useGetDatasetQuery } from 'store/services/api';
import { Dataset as DatasetFeature } from 'features';

export default function Dataset() {
    const { id } = useParams();
    const { data: dataset, isSuccess } = useGetDatasetQuery(id);

    return isSuccess ?
        <DatasetFeature dataset={dataset} /> :
        null;
}