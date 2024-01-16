import dayjs from 'dayjs';
import store from 'store';

function addCommonProperties(data, ownerOrg) {
   const user = store.getState().app.user;

   if (user !== null) {
      data['owner_org'] = ownerOrg;
      data['contributor_org'] = [user.organization];
      data['editor'] = user.email;
   }

   data['updatedate'] = dayjs().format();
}

export default addCommonProperties;