
Array.prototype.flat = Array.prototype.flat || function flattenDeep (arr1) {
   return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};
