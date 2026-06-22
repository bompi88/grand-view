// Document
export { createDocument } from './doc/create.js';
export {
  initDocument,
  metaMap,
  nodesMap,
  trashMap,
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
  type Anchor,
  type InsertNodeOptions,
  type MoveNodeOptions,
} from './nodes/operations.js';

// Selectors / read layer
export {
  buildTree,
  getNodeViews,
  getChildren,
  toNodeView,
  RECOVERED_ROOT,
  type TreeResult,
} from './nodes/selectors.js';

// Maintenance
export { normalizeSiblingPositions, maxKeyLength } from './nodes/normalize.js';
