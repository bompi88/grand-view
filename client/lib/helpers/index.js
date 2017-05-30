import general from './general';
import importAndExport from './import_export';
import docxGeneration from './docx_generation';
import nodes from './nodes';

export default {
  ...general,
  ...importAndExport,
  ...docxGeneration,
  ...nodes
};
