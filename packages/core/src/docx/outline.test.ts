import { describe, expect, it } from 'vitest';
import { createDocument } from '../doc/create.js';
import { insertNode, setNodeLabels } from '../nodes/operations.js';
import { buildOutline } from './outline.js';

describe('buildOutline', () => {
  it('numbers nodes hierarchically (1, 1.1, 1.1.1)', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const c1 = insertNode(doc, { nodeType: 'chapter', name: 'Intro' });
    insertNode(doc, { nodeType: 'chapter', name: 'Methods' });
    const s1 = insertNode(doc, { nodeType: 'chapter', name: 'Background', parentId: c1 });
    insertNode(doc, { nodeType: 'media', name: 'note', parentId: s1 });

    const outline = buildOutline(doc);
    expect(outline.map((o) => [o.number, o.name])).toEqual([
      ['1', 'Intro'],
      ['1.1', 'Background'],
      ['1.1.1', 'note'],
      ['2', 'Methods'],
    ]);
    expect(outline.map((o) => o.level)).toEqual([0, 1, 2, 0]);
  });

  it('carries tags/references on items', () => {
    const { doc } = createDocument({ createdAt: 0 });
    const m = insertNode(doc, { nodeType: 'media', name: 'm' });
    setNodeLabels(doc, m, 'tags', [{ value: 't', label: 'T' }]);
    const item = buildOutline(doc)[0]!;
    expect(item.tags).toEqual([{ value: 't', label: 'T' }]);
  });
});
