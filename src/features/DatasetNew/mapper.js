export function fromDbModel(dbModel) {
   return {
      id: dbModel.Id,
      name: dbModel.Name,
      description: dbModel.Description || '',
      isopendata: dbModel.IsOpenData,
      tableName: dbModel.TableName,
      attachedForvaltningObjektMetadataIds: dbModel.AttachedForvaltningObjektMetadataIds !== null ?
         dbModel.AttachedForvaltningObjektMetadataIds.map(id => ({ value: id })) :
         null,
      properties: dbModel.ForvaltningsObjektPropertiesMetadata.map(metadata => ({
         id: metadata.Id,
         name: metadata.Name,
         columnName: metadata.ColumnName,
         dataType: metadata.DataType,
         allowedValues: metadata.AllowedValues
      }))
   };
}

export function toDbModel(model) {
   return {
      name: model.name,
      description: model.description.trim() !== '' ? model.description : null,
      isopendata: model.isopendata,
      attachedForvaltningObjektMetadataIds: model.attachedForvaltningObjektMetadataIds.length > 0 ?
         model.attachedForvaltningObjektMetadataIds.map(metadata => metadata.value) :
         null,
      properties: model.properties.map(property => ({
         id: property.id || 0,
         name: property.name,
         dataType: property.dataType,
         allowedValues: property.allowedValues
      }))
   };
}

export function getDefaultValues() {
   return {
      name: '',
      description: '',
      isopendata: false,
      attachedForvaltningObjektMetadataIds: null,
      properties: [
         {
            name: '',
            dataType: '',
            allowedValues: []
         }
      ]
   };
}