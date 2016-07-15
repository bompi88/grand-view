import general from './general';
import importAndExport from './import_export';

console.log(general)
console.log(importAndExport)

export default {
  ...general,
  ...importAndExport
};
