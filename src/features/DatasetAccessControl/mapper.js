export function fromDbModel(dbModel) {  
   return {
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
}

export function toDbModel(model) {
   return {
      objekt: model.objekt,
      contributors: model.contributors.length ? model.contributors : null,
      accessByProperties: model.accessByProperties
         .flatMap(access => access.values
            .map(value => ({
               propertyId: access.propertyId,
               value: value.value,
               contributors: value.contributors
            })
         ))
   };
}
