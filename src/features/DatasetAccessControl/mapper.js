export function fromDbModel(dbModel) {
   const model = {
      objekt: dbModel.Id,
      contributors: dbModel.Contributors || [],
      accessByProperties: dbModel.ForvaltningsObjektPropertiesMetadata
         .filter(metadata => metadata.AccessByProperties.length > 0)
         .map(metadata => ({
            propertyId: metadata.Id,
            values: metadata.AccessByProperties
               .map(access => ({
                  value: access.Value,
                  contributors: access.Contributors
               }))
         }))
   };

   model.accessControlType = getAccessControlType(model);

   return model;
}

export function toDbModel(model) {
   const dbModel = {
      objekt: model.objekt
   };

   if (model.accessControlType === 'contributors') {
      dbModel.contributors = model.contributors.length ? model.contributors : null;
      dbModel.accessByProperties = [];
   } else {
      dbModel.contributors = null;
      dbModel.accessByProperties = model.accessByProperties
         .flatMap(access => access.values
            .map(value => ({
               propertyId: access.propertyId,
               value: value.value,
               contributors: value.contributors
            })
         ));
   }

   return dbModel;
}

function getAccessControlType(model) {
   return model.contributors.length > 0 || model.accessByProperties.length === 0 ?
      'contributors' :
      'properties';
}