export function fromDbModel(dbModel) {
   return {
      id: dbModel.Id,
      name: dbModel.Name,
      description: dbModel.Description || '',
      isopendata: dbModel.IsOpenData,
      tableName: dbModel.TableName,
      srid: dbModel.srid || 4326,
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
      srid: model.srid,
      properties: model.properties.map(property => ({
         id: property.id,
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
      srid: 4326,
      properties: [
         {
            name: '',
            dataType: '',
            allowedValues: null
         }
      ]
   };
}