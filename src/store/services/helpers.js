import dayjs from 'dayjs';
import store from 'store';

function addCommonProperties(data, ownerOrg, definition) {
    const user = store.getState().app.user;

    if (user !== null) {
        data['owner_org'] = ownerOrg;
        data['contributor_org'] = getContributors(definition, data);
        data['viewer_org'] = definition?.Viewers;
        data['editor'] = user.email;
    }

    data['updatedate'] = dayjs().format();
}

function getContributors(definition, data) {
    let contributors = definition.Contributors;

    if (contributors !== null) {
        return contributors;
    }

    const contributorsByProperty = definition.ForvaltningsObjektPropertiesMetadata
        .flatMap(property => {
            const inputValue = data[property.ColumnName];

            return property.AccessByProperties
                .filter(access => access.Value === inputValue)
                .map(access => access.Contributors);
        });

    return [...new Set(contributorsByProperty)];
}

export default addCommonProperties;