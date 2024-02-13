export function fromDbModel(dbModel) {
   return {
      id: dbModel.Id,
      name: dbModel.Name,
      description: dbModel.Description || '',
      isopendata: dbModel.IsOpenData,
      tableName: dbModel.TableName,
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
      oppstart: null,
      properties: [
         {
            name: '',
            dataType: '',
            allowedValues: []
         }
      ]
   };
}