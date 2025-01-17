import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAddDatasetMutation } from 'store/services/api';
import { useModal } from 'context/ModalProvider';
import { useBreadcrumbs } from 'features/Breadcrumbs';
import { modalType } from 'components/Modals';
import { getDefaultValues, toDbModel } from './mapper';
import DatasetForm from './DatasetForm';
import { Spinner } from 'components';
import styles from './DatasetNew.module.scss';

export default function DatasetNew() {
    useBreadcrumbs();
    const methods = useForm({ defaultValues: getDefaultValues() });
    const { handleSubmit, reset } = methods;
    const [loading, setLoading] = useState(false);
    const [addDataset] = useAddDatasetMutation();
    const { showModal } = useModal();

    function submit() {
        handleSubmit(async dataset => {
            setLoading(true);
            const payload = toDbModel(dataset);

            try {
                await addDataset(payload).unwrap();
                setLoading(false);
                reset(getDefaultValues());

                await showModal({
                    type: modalType.INFO,
                    variant: 'success',
                    title: 'Datasett opprettet',
                    body: `Datasettet '${dataset.name}' ble opprettet.`
                });
            } catch (error) {
                console.error(error);
                setLoading(false);

                await showModal({
                    type: modalType.INFO,
                    variant: 'error',
                    title: 'Feil',
                    body: `Datasettet '${dataset.name}' kunne ikke opprettes.`
                });
            }
        })();
    }

    return (
        <>
            <heading-text>
                <h1 underline="true">Legg til datasett</h1>
            </heading-text>

            <div className="container">
                <FormProvider {...methods}>
                    <DatasetForm />

                    <div className={styles.submit}>
                        <gn-button>
                            <button onClick={submit} disabled={loading}>Legg til datasett</button>
                        </gn-button>
                        {
                            loading ?
                                <Spinner style={{ position: 'absolute', top: '2px', right: '-42px' }} /> :
                                null
                        }
                    </div>
                </FormProvider>
            </div>
        </>
    );
}
