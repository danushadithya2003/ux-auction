import { CATEGORY_COLORS } from "../theme/categories";

// Simple flat placeholder illustrations, one per category, in that
// category's accent color. Swap these for real artwork later without
// touching any layout code - callers just pass a category index.

function UserIllustration({ accent, soft }) {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%">
      <rect width="220" height="140" rx="16" fill={soft} />
      <circle cx="72" cy="66" r="30" fill={accent} opacity="0.18" />
      <circle cx="72" cy="56" r="14" fill={accent} />
      <path d="M40 100c6-18 22-28 32-28s26 10 32 28" fill={accent} opacity="0.85" />
      <rect x="128" y="38" width="66" height="46" rx="10" fill="#fff" stroke={accent} strokeWidth="2" />
      <line x1="140" y1="52" x2="182" y2="52" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <line x1="140" y1="64" x2="170" y2="64" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M128 84l-10 12" stroke={accent} strokeWidth="2" fill="none" />
    </svg>
  );
}

function StakeholderIllustration({ accent, soft }) {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%">
      <rect width="220" height="140" rx="16" fill={soft} />
      <rect x="70" y="70" width="80" height="8" rx="4" fill={accent} opacity="0.3" />
      <circle cx="60" cy="48" r="16" fill={accent} />
      <path d="M38 88c4-14 12-22 22-22s18 8 22 22" fill={accent} opacity="0.85" />
      <circle cx="160" cy="48" r="16" fill={accent} opacity="0.55" />
      <path d="M138 88c4-14 12-22 22-22s18 8 22 22" fill={accent} opacity="0.4" />
      <rect x="90" y="94" width="40" height="30" rx="6" fill="#fff" stroke={accent} strokeWidth="2" />
      <line x1="98" y1="104" x2="122" y2="104" stroke={accent} strokeWidth="2" />
      <line x1="98" y1="112" x2="114" y2="112" stroke={accent} strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

function ProductSignalIllustration({ accent, soft }) {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%">
      <rect width="220" height="140" rx="16" fill={soft} />
      <rect x="40" y="70" width="20" height="40" rx="4" fill={accent} opacity="0.4" />
      <rect x="68" y="50" width="20" height="60" rx="4" fill={accent} opacity="0.65" />
      <rect x="96" y="30" width="20" height="80" rx="4" fill={accent} />
      <rect x="124" y="58" width="20" height="52" rx="4" fill={accent} opacity="0.55" />
      <path d="M40 40l30-14 28 10 30-18" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="128" cy="18" r="5" fill={accent} />
      <path d="M150 110h34" stroke={accent} strokeWidth="2" opacity="0.4" />
    </svg>
  );
}

function BusinessConstraintIllustration({ accent, soft }) {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%">
      <rect width="220" height="140" rx="16" fill={soft} />
      <circle cx="90" cy="70" r="42" fill="#fff" stroke={accent} strokeWidth="3" />
      <line x1="90" y1="70" x2="90" y2="42" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <line x1="90" y1="70" x2="112" y2="80" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <circle cx="90" cy="70" r="4" fill={accent} />
      <rect x="150" y="46" width="34" height="42" rx="6" fill={accent} opacity="0.85" />
      <rect x="158" y="36" width="18" height="14" rx="4" fill="none" stroke={accent} strokeWidth="3" />
      <circle cx="167" cy="68" r="4" fill="#fff" />
    </svg>
  );
}

function TeamProcessIllustration({ accent, soft }) {
  return (
    <svg viewBox="0 0 220 140" width="100%" height="100%">
      <rect width="220" height="140" rx="16" fill={soft} />
      <rect x="34" y="46" width="46" height="46" rx="10" fill={accent} opacity="0.85" />
      <rect x="90" y="30" width="46" height="46" rx="10" fill={accent} opacity="0.55" />
      <rect x="146" y="54" width="46" height="46" rx="10" fill={accent} opacity="0.3" />
      <path d="M80 68h10M136 52h10" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const ILLUSTRATIONS = [UserIllustration, StakeholderIllustration, ProductSignalIllustration, BusinessConstraintIllustration, TeamProcessIllustration];

export default function CategoryIllustration({ index = 0, categoryName }) {
  const i = ((index % ILLUSTRATIONS.length) + ILLUSTRATIONS.length) % ILLUSTRATIONS.length;
  const Comp = ILLUSTRATIONS[i];
  const theme = CATEGORY_COLORS[i];
  return (
    <div className="category-illustration" role="img" aria-label={categoryName ? `${categoryName} illustration` : "illustration"}>
      <Comp accent={theme.accent} soft={theme.soft} />
    </div>
  );
}
