import { describe, expect, it } from 'vitest';
import { createDocument } from '../doc/create.js';
import { insertNode, setNodeLabels } from '../nodes/operations.js';
import {
  listLabelUsage,
  nodesWithLabel,
  nodesWithoutLabels,
  removeLabelEverywhere,
  renameLabel,
} from './labels.js';

function seed() {
  const { doc } = createDocument({ createdAt: 0 });
  const a = insertNode(doc, { nodeType: 'media', name: 'a' });
  const b = insertNode(doc, { nodeType: 'media', name: 'b' });
  const c = insertNode(doc, { nodeType: 'media', name: 'c' });
  setNodeLabels(doc, a, 'tags', [{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }]);
  setNodeLabels(doc, b, 'tags', [{ value: 'x', label: 'X' }]);
  // c has no tags
  return { doc, a, b, c };
}

describe('label usage + filtering', () => {
  it('lists usage with counts', () => {
    const { doc } = seed();
    expect(listLabelUsage(doc, 'tags')).toEqual([
      { value: 'x', label: 'X', count: 2 },
      { value: 'y', label: 'Y', count: 1 },
    ]);
  });

  it('finds nodes with a label and untagged nodes', () => {
    const { doc, a, b, c } = seed();
    expect(nodesWithLabel(doc, 'tags', 'x').map((n) => n.id).sort()).toEqual([a, b].sort());
    expect(nodesWithoutLabels(doc, 'tags').map((n) => n.id)).toEqual([c]);
  });

  it('renames a label everywhere', () => {
    const { doc } = seed();
    expect(renameLabel(doc, 'tags', 'x', 'Xenon')).toBe(2);
    const usage = listLabelUsage(doc, 'tags');
    expect(usage.find((u) => u.value === 'x')!.label).toBe('Xenon');
  });

  it('removes a label everywhere', () => {
    const { doc } = seed();
    expect(removeLabelEverywhere(doc, 'tags', 'x')).toBe(2);
    expect(listLabelUsage(doc, 'tags').map((u) => u.value)).toEqual(['y']);
  });
});
