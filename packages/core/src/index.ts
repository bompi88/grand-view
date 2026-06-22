// Document
export { createDocument } from './doc/create.js';
export {
  initDocument,
  metaMap,
  nodesMap,
  trashMap,
  nodeDescriptionFragment,
  buildNodeMap,
  META,
  NODES,
  TRASH,
  type CreateDocumentOptions,
  type NodeSpec,
  type NodeMap,
} from './doc/schema.js';

// Ordering
export {
  keyForAppend,
  keyForPrepend,
  keyBetween,
  keysBetween,
  comparePosition,
} from './ordering/fractional.js';

// Node operations
export {
  insertNode,
  moveNode,
  duplicateSubtree,
  removeToTrash,
  restoreFromTrash,
  emptyTrash,
  setNodeLabels,
  renameNode,
  setCollapsed,
  addNodeFile,
  removeNodeFile,
  type Anchor,
  type InsertNodeOptions,
  type MoveNodeOptions,
} from './nodes/operations.js';

// Selectors / read layer
export {
  buildTree,
  getNodeViews,
  getChildren,
  getTrashRoots,
  toNodeView,
  RECOVERED_ROOT,
  type TreeResult,
  type TrashEntry,
} from './nodes/selectors.js';

// Maintenance
export { normalizeSiblingPositions, maxKeyLength } from './nodes/normalize.js';

// Undo / redo
export { createUndoController, LOCAL_ORIGIN, type UndoController } from './undo/undo.js';

// Document library
export {
  createLibrary,
  libraryDocs,
  addDocumentEntry,
  renameDocumentEntry,
  touchDocumentEntry,
  softRemoveDocumentEntry,
  restoreDocumentEntry,
  deleteDocumentEntry,
  listDocuments,
  listTemplates,
  listDocumentTrash,
  getDocumentMeta,
  LIBRARY_GUID,
  type AddDocumentInput,
} from './library/library.js';
