import React from 'react';

// أيقونة الكادِنس (Cadence)
export const CadenceIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#2ee7b8ff" />
    <path d="M32 12 L32 32 L44 44" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// أيقونة زاوية الركبة (Knees)
export const KneesIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <rect x="20" y="12" width="24" height="40" fill="#ff6b6b" rx="4"/>
    <circle cx="32" cy="32" r="6" fill="#fff"/>
  </svg>
);

// أيقونة ميل الجذع (Trunk Lean)
export const TrunkIcon = ({ size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path d="M32 8 C28 20, 28 40, 32 56" fill="none" stroke="#1ef4ffff" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="32" cy="8" r="6" fill="#1ef4ffff"/>
  </svg>
);


// أيقونة التماثل (Symmetry)
export const SymmetryIcon = ({ size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <line x1="32" y1="8" x2="32" y2="56" stroke="#2ECC71" strokeWidth="3" strokeDasharray="4 2"/>
    <circle cx="20" cy="32" r="6" fill="#2ECC71"/>
    <circle cx="44" cy="32" r="6" fill="#2ECC71"/>
  </svg>
);

