import { orderBy } from "lodash";

export function getAllowedValuesForUser(
   columnName,
   metadata,
   user,
   ownerOrganization
) {
   if (user === null) {
      return [];
   }

   const column = metadata.find((data) => data.ColumnName === columnName);

   if (column.AllowedValues === null) {
      return null;
   }

   if (
      column.AccessByProperties.length === 0 ||
      user.organization === ownerOrganization
   ) {
      return column.AllowedValues;
   }

   const values = column.AccessByProperties.filter((access) =>
      access.Contributors.some((orgNo) => orgNo === user.organization)
   ).map((access) => access.Value);

   return orderBy(values, (value) => value.toLowerCase());
}
