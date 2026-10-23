/** Vault-door mark: a round door with a spoked handle, in the brand color. */
export default function VaultMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="8" fill="var(--color-brand)" />
      {/* hinges */}
      <rect x="4" y="10" width="3" height="5" rx="1" fill="#faf6ef" opacity=".85" />
      <rect x="4" y="25" width="3" height="5" rx="1" fill="#faf6ef" opacity=".85" />
      {/* door */}
      <circle cx="21" cy="20" r="13" fill="none" stroke="#faf6ef" strokeWidth="2" />
      <circle cx="21" cy="20" r="9.5" fill="none" stroke="#faf6ef" strokeWidth="1" opacity=".55" />
      {/* spoked handle */}
      <g stroke="#faf6ef" strokeWidth="2" strokeLinecap="round">
        <line x1="21" y1="13.5" x2="21" y2="26.5" />
        <line x1="15.4" y1="16.75" x2="26.6" y2="23.25" />
        <line x1="15.4" y1="23.25" x2="26.6" y2="16.75" />
      </g>
      <circle cx="21" cy="20" r="2.6" fill="#faf6ef" />
    </svg>
  );
}
