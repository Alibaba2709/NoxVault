interface NoxVaultLogoProps {
  compact?: boolean;
  className?: string;
  showTagline?: boolean;
}

export function NoxVaultLogo({
  compact = false,
  className = "",
  showTagline = false,
}: NoxVaultLogoProps) {
  const markSize = compact ? "h-10 w-10" : "h-20 w-20";
  const textSize = compact ? "text-2xl" : "text-5xl sm:text-6xl";

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`relative shrink-0 ${markSize}`} aria-hidden="true">
        <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-xl">
          <defs>
            <linearGradient id="nox-crescent" x1="14" y1="18" x2="94" y2="104">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="0.45" stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="nox-teal" x1="58" y1="95" x2="98" y2="40">
              <stop offset="0" stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#2dd4bf" />
            </linearGradient>
            <radialGradient id="nox-glow" cx="50%" cy="45%" r="58%">
              <stop offset="0" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="1" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="62" cy="61" r="48" fill="url(#nox-glow)" />
          <path
            d="M78 10C46 13 20 39 20 70c0 30 24 44 48 42 17-2 32-10 41-24-11 7-24 10-38 8-26-4-43-23-40-49 2-20 21-34 47-37Z"
            fill="url(#nox-crescent)"
          />
          <path
            d="M62 25c28 0 48 21 48 49 0 10-3 20-8 28 9-8 15-21 15-36 0-31-24-54-55-54-9 0-17 2-24 6 7-2 15-2 24 7Z"
            fill="url(#nox-teal)"
            opacity="0.92"
          />
          <path
            d="M42 78h10v20H42Zm19-12h10v32H61Zm19-13h10v45H80Z"
            fill="url(#nox-teal)"
          />
          <path
            d="M39 73 58 55l16 8 24-29"
            fill="none"
            stroke="#f8fafc"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="6"
          />
          <circle cx="39" cy="73" r="5" fill="#f8fafc" />
          <circle cx="58" cy="55" r="5" fill="#f8fafc" />
          <path d="M92 34h10v10" fill="none" stroke="#f8fafc" strokeWidth="6" />
          <path d="M54 37h5l2-6 2 6h5l-4 3 2 6-5-4-5 4 2-6Z" fill="#f8fafc" />
          <path d="M74 29h3l1-3 1 3h3l-2 2 1 3-3-2-3 2 1-3Z" fill="#38bdf8" />
        </svg>
      </div>

      <div className="min-w-0">
        <div
          className={`${textSize} font-semibold leading-none tracking-normal text-slate-100`}
        >
          Nox<span className="bg-gradient-to-r from-sky-400 to-teal-300 bg-clip-text text-transparent">Vault</span>
        </div>
        {showTagline ? (
          <div className="mt-3 text-xs font-medium uppercase tracking-[0.34em] text-slate-400">
            Traccia. Pianifica. Cresci.
          </div>
        ) : null}
      </div>
    </div>
  );
}
