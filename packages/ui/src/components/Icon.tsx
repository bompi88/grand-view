import type { SVGProps } from 'react';

/** Minimal inline stroke-icon set (no external assets — offline/CSP-safe). */
const PATHS: Record<string, string> = {
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  grip: 'M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01',
  trash: 'M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 002 2h8a2 2 0 002-2l1-13M9 7V4h6v3',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  note: 'M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5M9 13h6M9 17h4',
  copy: 'M9 9h10a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V10a1 1 0 011-1zM5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1',
  undo: 'M9 14l-4-4 4-4M5 10h11a4 4 0 010 8h-1',
  redo: 'M15 14l4-4-4-4M19 10H8a4 4 0 000 8h1',
  'collapse-all': 'M8 4l4 4 4-4M8 20l4-4 4 4',
  'expand-all': 'M8 8l4-4 4 4M8 16l4 4 4-4',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M16 9a1 1 0 100-2 1 1 0 000 2z',
  download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
  open: 'M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h5',
  x: 'M6 6l12 12M18 6L6 18',
  back: 'M15 6l-6 6 6 6',
  'doc-plus': 'M14 3H7a1 1 0 00-1 1v16a1 1 0 001 1h10a1 1 0 001-1V8zM14 3v5h5M12 11v6M9 14h6',
  restore: 'M5 12a7 7 0 107-7 7 7 0 00-5 2.1L5 9M5 5v4h4',
  template: 'M4 5h16v4H4zM4 13h7v6H4zM15 13h5v6h-5z',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3',
  share: 'M16 8a3 3 0 10-2.8-4M8 14a3 3 0 100-4 3 3 0 000 4zM16 20a3 3 0 10-2.8-4M10.5 13l3 2M13.5 7l-3 2',
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: keyof typeof PATHS | string;
  size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
  const d = PATHS[name] ?? '';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {d.split('M').filter(Boolean).map((seg, i) => (
        <path key={i} d={'M' + seg} />
      ))}
    </svg>
  );
}
