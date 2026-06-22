import { nanoid } from 'nanoid';

/** Branded id types — prevent mixing a node id where a document id is expected. */
export type DocumentId = string & { readonly __brand: 'DocumentId' };
export type NodeId = string & { readonly __brand: 'NodeId' };
export type FileId = string & { readonly __brand: 'FileId' };

/** Sentinel parent id for top-level nodes (children of the document root). */
export const ROOT_PARENT = '$root' as NodeId;

export const newDocumentId = (): DocumentId => nanoid() as DocumentId;
export const newNodeId = (): NodeId => nanoid() as NodeId;
export const newFileId = (): FileId => nanoid() as FileId;

/** Stable per-install device id, used for file-sync per-device logs and presence. */
export const newDeviceId = (): string => nanoid(10);
