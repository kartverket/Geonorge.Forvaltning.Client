import { api } from "./api";

const cacheUpdater = {
   deleteDataset: (dispatch, args) => {
      dispatch(
         api.util.updateQueryData(
            "getDatasetDefinitions",
            undefined,
            (cachedData) => {
               const index = cachedData.findIndex(
                  (dataset) => dataset.Id === args.id
               );
               cachedData.splice(index, 1);
            }
         )
      );
   },
   addDatasetObject: (dispatch, args, updatedData) => {
      dispatch(
         api.util.updateQueryData(
            "getDataset",
            args.tableId.toString(),
            (cachedData) => {
               cachedData.objects.unshift(updatedData);
            }
         )
      );
   },
   updateDatasetObject: (dispatch, args) => {
      dispatch(
         api.util.updateQueryData(
            "getDataset",
            args.tableId.toString(),
            (cachedData) => {
               const object = cachedData.objects.find(
                  (object) => object.id === args.payload.id
               );
               const objectKeys = Object.keys(object);

               Object.entries(args.payload)
                  .filter((entry) => objectKeys.includes(entry[0]))
                  .forEach((entry) => {
                     if (entry[0] === "geometry") {
                        object[entry[0]] = JSON.parse(entry[1]);
                     } else {
                        object[entry[0]] = entry[1];
                     }
                  });
            }
         )
      );
   },
   deleteDatasetObjects: (dispatch, args) => {
      dispatch(
         api.util.updateQueryData(
            "getDataset",
            args.tableId.toString(),
            (cachedData) => {
               const objects = cachedData.objects.filter(
                  (object) => !args.ids.includes(object.id)
               );
               cachedData.objects = objects;
            }
         )
      );
   },
   deleteAllDatasetObjects: (dispatch, args) => {
      dispatch(
         api.util.updateQueryData(
            "getDataset",
            args.tableId.toString(),
            (cachedData) => {
               cachedData.objects = [];
            }
         )
      );
   },
};

export default cacheUpdater;
