//--------------------------------------------------------------------------------------------------
// Publication entry file
//--------------------------------------------------------------------------------------------------

import documents from './documents';
import templates from './templates';
import files from './files';
import nodes from './nodes';
import references from './references';
import settings from './settings';
import tags from './tags';


export default function () {
  documents();
  templates();
  files();
  nodes();
  references();
  settings();
  tags();
}
