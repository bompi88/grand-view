/** Minimal tar (ustar) reader — legacy GrandView `.gvd`/`.gvt` are tar archives. */
export interface TarEntry {
  name: string;
  bytes: Uint8Array;
}

function readString(buf: Uint8Array, offset: number, length: number): string {
  let end = offset;
  const max = offset + length;
  while (end < max && buf[end] !== 0) end++;
  return new TextDecoder().decode(buf.subarray(offset, end));
}

export function untar(data: Uint8Array): TarEntry[] {
  const entries: TarEntry[] = [];
  let pos = 0;
  while (pos + 512 <= data.length) {
    const name = readString(data, pos, 100);
    if (name === '') break; // two zero blocks at the end
    const sizeOctal = readString(data, pos + 124, 12).trim();
    const size = parseInt(sizeOctal || '0', 8) || 0;
    const prefix = readString(data, pos + 345, 155);
    const fullName = prefix ? `${prefix}/${name}` : name;
    const start = pos + 512;
    entries.push({ name: fullName, bytes: data.subarray(start, start + size) });
    pos = start + Math.ceil(size / 512) * 512;
  }
  return entries;
}
