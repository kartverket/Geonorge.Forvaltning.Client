import { useEffect, useState } from 'react';
import { useGetDatasetDefinitionsQuery, useLazyGetOrganizationNameQuery } from 'store/services/api';
import { Home as HomeFeature } from 'features';

export default function Home() {
    const { data: _definitions, isSuccess } = useGetDatasetDefinitionsQuery();
    const [getOrganizationName] = useLazyGetOrganizationNameQuery();
    const [definitions, setDefinitions] = useState(null);

    useEffect(
        () => {
            if (!isSuccess) {
                return;
            }

            const newDefinitions = [];

            (async () => {
                for (const definition of _definitions) {
                    const newDefinition = {
                        ...definition,
                        organizationName: definition.Organization !== null ?
                            await getOrganizationName(definition.Organization).unwrap() :
                            null
                    };

                    newDefinitions.push(newDefinition);
                }

                setDefinitions(newDefinitions)
            })();
        },
        [isSuccess, _definitions, getOrganizationName]
    );

   return definitions !== null && <HomeFeature datasets={definitions} />;
}