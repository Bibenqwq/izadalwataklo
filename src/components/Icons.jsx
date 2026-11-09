import React from 'react';

const defaultProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export function IconFolder({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconFolderOpen({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M6 2v4M2 6h20v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
      <path d="M2 10h20" />
    </svg>
  );
}

export function IconFolderPlus({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

export function IconFileText({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function IconSave({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function IconEdit({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function IconTrash({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function IconPrinter({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export function IconShare({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </svg>
  );
}

export function IconImage({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export function IconSearch({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconCalendar({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconUser({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconComputer({ size = 16, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function IconGrid({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function IconList({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export function IconEye({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconMaximize({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function IconX({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconCheck({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconHighlighter({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M9 11l-6 6v3h3l6-6" />
      <path d="M22 7l-5-5-11 11 5 5 11-11z" />
    </svg>
  );
}

export function IconAlignLeft({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

export function IconAlignCenter({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="18" y1="10" x2="6" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  );
}

export function IconAlignRight({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  );
}

export function IconAlignJustify({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="21" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="3" y2="18" />
    </svg>
  );
}

export function IconListBullet({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconListNumber({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4M3 10h2M3 14h2l-2 2h2v2M3 18h2" />
    </svg>
  );
}

export function IconUndo({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="9 14 4 9 9 4" />
      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

export function IconRedo({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="15 14 20 9 15 4" />
      <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
    </svg>
  );
}

export function IconPaperLines({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

export function IconFileBlank({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function IconArrowLeft({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconArrowRight({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function IconArrowUp({ size = 14, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export function IconRotateLeft({ size = 12, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

export function IconRotateRight({ size = 12, className = '', ...props }) {
  return (
    <svg {...defaultProps} width={size} height={size} className={className} {...props}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
