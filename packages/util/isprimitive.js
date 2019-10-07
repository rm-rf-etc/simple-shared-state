import isString from "lodash.isstring";
import isNumber from "lodash.isnumber";
import isBoolean from "lodash.isboolean";

export default (thing) => (
    isString(thing) || isNumber(thing) || isBoolean(thing)
);
