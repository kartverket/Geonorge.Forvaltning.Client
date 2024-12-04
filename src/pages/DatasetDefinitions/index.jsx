import { useParams } from 'react-router-dom';
import { useGetDatasetDefinitionQuery } from 'store/services/api';
import { DefaultLayout } from 'components';
import { DatasetDefinitions as DatasetDefinitionsFeature } from 'features';

export default function DatasetDefinitions() {
    const { id } = useParams();
    const { data: dataset, isSuccess } = useGetDatasetDefinitionQuery(id);

    return (
        <DefaultLayout>
            {isSuccess ? <DatasetDefinitionsFeature dataset={dataset} /> : null}
        </DefaultLayout>
    );
}