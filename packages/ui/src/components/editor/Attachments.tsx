import { useEffect, useState } from 'react';
import { newFileId, type FileMeta, type NodeId } from '@gv/shared';
import { usePlatform } from '../../providers/PlatformContext.js';
import { useNodeOps } from '../../hooks/useNodeOps.js';
import { Icon } from '../Icon.js';

function FileThumb({ blobRef }: { blobRef: string }) {
  const platform = usePlatform();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let revoke: string | null = null;
    void platform.blobStore.url(blobRef).then((u) => {
      revoke = u;
      setUrl(u);
    });
    return () => {
      if (revoke?.startsWith('blob:')) URL.revokeObjectURL(revoke);
    };
  }, [platform, blobRef]);
  if (!url) return <span className="gv-file-thumb gv-file-thumb-empty" />;
  return <img className="gv-file-thumb" src={url} alt="" />;
}

export function Attachments({ nodeId, files }: { nodeId: NodeId; files: FileMeta[] }) {
  const platform = usePlatform();
  const ops = useNodeOps();
  const [dragging, setDragging] = useState(false);

  async function attachBytes(name: string, mime: string, bytes: Uint8Array) {
    const blobRef = await platform.blobStore.put(bytes, mime);
    ops.addFile(nodeId, {
      id: newFileId(),
      name,
      mime,
      size: bytes.byteLength,
      isImage: mime.startsWith('image/'),
      blobRef,
    });
  }

  async function attachFile(file: File) {
    await attachBytes(file.name, file.type || 'application/octet-stream', new Uint8Array(await file.arrayBuffer()));
  }

  async function onPasteImage() {
    const bytes = await platform.clipboard.readImage();
    if (bytes) await attachBytes('pasted-image.png', 'image/png', bytes);
  }

  async function download(file: FileMeta) {
    const bytes = await platform.blobStore.get(file.blobRef);
    await platform.picker.saveFile({ suggestedName: file.name, mime: file.mime, bytes });
  }

  async function open(file: FileMeta) {
    const url = await platform.blobStore.url(file.blobRef);
    await platform.shell.openExternal(url);
  }

  async function remove(file: FileMeta) {
    const blobRef = ops.removeFile(nodeId, file.id);
    if (blobRef) await platform.blobStore.delete(blobRef);
  }

  return (
    <div className="gv-attachments" data-testid="attachments">
      <label className="gv-labels-title">
        <Icon name="image" size={13} />
        Attachments
      </label>

      {files.length > 0 && (
        <ul className="gv-file-list">
          {files.map((f) => (
            <li key={f.id} className="gv-file" data-testid={`file-${f.id}`}>
              {f.isImage ? (
                <FileThumb blobRef={f.blobRef} />
              ) : (
                <span className="gv-file-badge">
                  <Icon name="note" size={18} />
                </span>
              )}
              <span className="gv-file-name">{f.name}</span>
              <span className="gv-file-actions">
                <button className="gv-icon-btn" title="Open" onClick={() => void open(f)}>
                  <Icon name="open" size={15} />
                </button>
                <button className="gv-icon-btn" title="Download" onClick={() => void download(f)}>
                  <Icon name="download" size={15} />
                </button>
                <button className="gv-icon-btn" title="Delete" onClick={() => void remove(f)}>
                  <Icon name="trash" size={15} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div
        className={`gv-dropzone${dragging ? ' gv-dropzone-active' : ''}`}
        data-testid="dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          for (const file of Array.from(e.dataTransfer.files)) void attachFile(file);
        }}
      >
        <label className="gv-link">
          Choose file
          <input
            type="file"
            multiple
            data-testid="file-input"
            style={{ display: 'none' }}
            onChange={(e) => {
              for (const file of Array.from(e.target.files ?? [])) void attachFile(file);
              e.target.value = '';
            }}
          />
        </label>
        <span className="gv-muted-text">· drag &amp; drop ·</span>
        <button className="gv-link" onClick={() => void onPasteImage()}>
          paste image
        </button>
      </div>
    </div>
  );
}
