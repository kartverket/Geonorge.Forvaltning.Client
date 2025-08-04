import { isPlainObject } from "lodash";

export function hasError(error) {
   return isPlainObject(error) && Object.hasOwn(error, "message");
}
