import { useNav } from '../state/nav.js';
import { LibraryScreen } from './library/LibraryScreen.js';
import { DocumentHost } from './DocumentHost.js';

/** Routes between the document library and an open document. */
export function AppRoot() {
  const openDocId = useNav((s) => s.openDocId);
  return openDocId ? <DocumentHost id={openDocId} /> : <LibraryScreen />;
}
