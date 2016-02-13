import documents from './documents';
import files from './files';
import nodes from './nodes';
import references from './references';
import settings from './settings';
import tags from './tags';


export default function () {
  documents();
  files();
  nodes();
  references();
  settings();
  tags();
}
