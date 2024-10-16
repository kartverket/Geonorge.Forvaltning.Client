import dayjs from 'dayjs';
import { forEach } from 'lodash';
import store from 'store';

function addCommonProperties(data, ownerOrg, definition) {
   const user = store.getState().app.user;
   if (user !== null) {
      data['owner_org'] = ownerOrg;
      data['contributor_org'] = getContributors(definition);
      data['viewer_org'] = definition.Viewers;      ;
      data['editor'] = user.email;
   }

   data['updatedate'] = dayjs().format();
}

function getContributors(definition) {

   let contributors = definition.Contributors;

   if (contributors === null) {
      let contributorByProperty = [];
      definition.ForvaltningsObjektPropertiesMetadata.forEach((property) => {
         property.AccessByProperties.forEach((access) => {
            var contributors = access.Contributors;
            contributorByProperty = contributorByProperty.concat(contributors);          
         });
      });

      if(contributorByProperty.length > 0) {
         var contributorByPropertyDistinct = Array.from(new Set(contributorByProperty));
         contributors = contributorByPropertyDistinct;
      }
   } 

   return contributors;
}

export default addCommonProperties;