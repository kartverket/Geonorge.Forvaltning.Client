export function getTableStyle(definition) {
   const metadata = definition.ForvaltningsObjektPropertiesMetadata;
   const parts = ["minmax(0px, .75fr)"];

   for (let i = 0; i < metadata.length; i++) {
      const fr = metadata[i].DataType === "text" ? 1 : 0.75;
      parts.push(`minmax(0px, ${fr}fr)`);
   }

   parts.push("minmax(0px, .25fr)");

   return {
      gridTemplateColumns: parts.join(" "),
   };
}
