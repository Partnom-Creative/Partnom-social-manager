import * as React from "react";

const W = 80;
const H = 52;
const r = 6;
const mid = W / 2;

/** Simplified app window — light */
export function ThemePreviewLight({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden width={W} height={H}>
      <rect width={W} height={H} rx={r} fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="1" />
      <rect x="6" y="6" width={W - 12} height="8" rx="2" fill="#fafafa" />
      <circle cx="11" cy="10" r="1.6" fill="#ef4444" opacity="0.85" />
      <circle cx="16" cy="10" r="1.6" fill="#eab308" opacity="0.85" />
      <circle cx="21" cy="10" r="1.6" fill="#22c55e" opacity="0.85" />
      <rect x="6" y="18" width="14" height={H - 24} rx="2" fill="#fafafa" stroke="#e4e4e7" strokeWidth="0.75" />
      <circle cx="13" cy="25" r="3" fill="#d4d4d8" />
      <rect x="9" y="31" width="8" height="1.5" rx="0.5" fill="#e4e4e7" />
      <rect x="9" y="35" width="8" height="1.5" rx="0.5" fill="#e4e4e7" />
      <rect x="9" y="39" width="6" height="1.5" rx="0.5" fill="#e4e4e7" />
      <rect x="24" y="18" width={W - 30} height="8" rx="2" fill="#fafafa" stroke="#e4e4e7" strokeWidth="0.75" />
      <text x="28" y="23.5" fontSize="5" fill="#71717a" fontFamily="system-ui, sans-serif">
        Your dashboard
      </text>
      <rect x={W - 22} y="20" width="6" height="4" rx="1" fill="#e4e4e7" />
      <rect x={W - 14} y="20" width="6" height="4" rx="1" fill="#e4e4e7" />
      <rect x="24" y="28" width={W - 30} height={H - 34} rx="2" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.75" />
    </svg>
  );
}

/** Dark */
export function ThemePreviewDark({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden width={W} height={H}>
      <rect width={W} height={H} rx={r} fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
      <rect x="6" y="6" width={W - 12} height="8" rx="2" fill="#27272a" />
      <circle cx="11" cy="10" r="1.6" fill="#ef4444" opacity="0.75" />
      <circle cx="16" cy="10" r="1.6" fill="#eab308" opacity="0.75" />
      <circle cx="21" cy="10" r="1.6" fill="#22c55e" opacity="0.75" />
      <rect x="6" y="18" width="14" height={H - 24} rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="0.75" />
      <circle cx="13" cy="25" r="3" fill="#52525b" />
      <rect x="9" y="31" width="8" height="1.5" rx="0.5" fill="#3f3f46" />
      <rect x="9" y="35" width="8" height="1.5" rx="0.5" fill="#3f3f46" />
      <rect x="9" y="39" width="6" height="1.5" rx="0.5" fill="#3f3f46" />
      <rect x="24" y="18" width={W - 30} height="8" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="0.75" />
      <text x="28" y="23.5" fontSize="5" fill="#a1a1aa" fontFamily="system-ui, sans-serif">
        Your dashboard
      </text>
      <rect x={W - 22} y="20" width="6" height="4" rx="1" fill="#3f3f46" />
      <rect x={W - 14} y="20" width="6" height="4" rx="1" fill="#3f3f46" />
      <rect x="24" y="28" width={W - 30} height={H - 34} rx="2" fill="#1f1f23" stroke="#3f3f46" strokeWidth="0.75" />
    </svg>
  );
}

/** Split: left light, right dark — single SVG */
export function ThemePreviewSystem({ className }: { className?: string }) {
  const uid = React.useId().replace(/:/g, "");
  const leftId = `sys-left-${uid}`;
  const rightId = `sys-right-${uid}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden width={W} height={H}>
      <defs>
        <clipPath id={leftId}>
          <rect x="0" y="0" width={mid} height={H} />
        </clipPath>
        <clipPath id={rightId}>
          <rect x={mid} y="0" width={mid} height={H} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${leftId})`}>
        <rect width={W} height={H} rx={r} fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="1" />
        <rect x="6" y="6" width={W - 12} height="8" rx="2" fill="#fafafa" />
        <circle cx="11" cy="10" r="1.6" fill="#ef4444" opacity="0.85" />
        <circle cx="16" cy="10" r="1.6" fill="#eab308" opacity="0.85" />
        <circle cx="21" cy="10" r="1.6" fill="#22c55e" opacity="0.85" />
        <rect x="6" y="18" width="14" height={H - 24} rx="2" fill="#fafafa" stroke="#e4e4e7" strokeWidth="0.75" />
        <circle cx="13" cy="25" r="3" fill="#d4d4d8" />
        <rect x="9" y="31" width="8" height="1.5" rx="0.5" fill="#e4e4e7" />
        <rect x="9" y="35" width="8" height="1.5" rx="0.5" fill="#e4e4e7" />
        <rect x="24" y="18" width={W - 30} height="8" rx="2" fill="#fafafa" stroke="#e4e4e7" strokeWidth="0.75" />
        <text x="28" y="23.5" fontSize="5" fill="#71717a" fontFamily="system-ui, sans-serif">
          Your dashboard
        </text>
        <rect x="24" y="28" width={W - 30} height={H - 34} rx="2" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="0.75" />
      </g>
      <g clipPath={`url(#${rightId})`}>
        <rect width={W} height={H} rx={r} fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
        <rect x="6" y="6" width={W - 12} height="8" rx="2" fill="#27272a" />
        <circle cx="11" cy="10" r="1.6" fill="#ef4444" opacity="0.75" />
        <circle cx="16" cy="10" r="1.6" fill="#eab308" opacity="0.75" />
        <circle cx="21" cy="10" r="1.6" fill="#22c55e" opacity="0.75" />
        <rect x="6" y="18" width="14" height={H - 24} rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="0.75" />
        <circle cx="13" cy="25" r="3" fill="#52525b" />
        <rect x="9" y="31" width="8" height="1.5" rx="0.5" fill="#3f3f46" />
        <rect x="9" y="35" width="8" height="1.5" rx="0.5" fill="#3f3f46" />
        <rect x="24" y="18" width={W - 30} height="8" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="0.75" />
        <text x="28" y="23.5" fontSize="5" fill="#a1a1aa" fontFamily="system-ui, sans-serif">
          Your dashboard
        </text>
        <rect x="24" y="28" width={W - 30} height={H - 34} rx="2" fill="#1f1f23" stroke="#3f3f46" strokeWidth="0.75" />
      </g>
      <line x1={mid} y1="0" x2={mid} y2={H} stroke="#71717a" strokeWidth="0.75" opacity="0.45" />
    </svg>
  );
}
