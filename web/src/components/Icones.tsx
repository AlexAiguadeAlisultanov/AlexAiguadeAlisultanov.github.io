// Una sola familia de iconos, todos de linea y con el mismo grosor de trazo (1.5).
// Las banderas van dibujadas a mano: Windows no pinta los emoji de bandera y la senyera
// ni siquiera existe como emoji.

type Props = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const
};

const mida = "h-[1em] w-[1em]";

export function Fletxa({ className = "" }: Props) {
  return (
    <svg {...base} className={`${mida} ${className}`}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Baixa({ className = "" }: Props) {
  return (
    <svg {...base} className={`${mida} ${className}`}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function GitHub({ className = "" }: Props) {
  return (
    <svg {...base} className={`${mida} ${className}`}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 2-2.64-.5-5.36-.5-8 0-2-2-3-2-3-2-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function LinkedIn({ className = "" }: Props) {
  return (
    <svg {...base} className={`${mida} ${className}`}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-10h4v1.8A6 6 0 0 1 16 8z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Correu({ className = "" }: Props) {
  return (
    <svg {...base} className={`${mida} ${className}`}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 8.97 5.7a2 2 0 0 0 2.06 0L22 7" />
    </svg>
  );
}

export function Xat({ className = "" }: Props) {
  return (
    <svg {...base} className={`${mida} ${className}`}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  );
}

export function Escut({ className = "" }: Props) {
  return (
    <svg {...base} className={`${mida} ${className}`}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ---------- Banderas ---------- */

const bandera = "h-3 w-[18px] shrink-0 rounded-[2px] ring-1 ring-white/20";

export function BanderaES({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden focusable="false" className={`${bandera} ${className}`}>
      <path fill="#C60B1E" d="M0 0h24v16H0z" />
      <path fill="#FFC400" d="M0 4h24v8H0z" />
    </svg>
  );
}

export function BanderaCA({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden focusable="false" className={`${bandera} ${className}`}>
      <path fill="#FCDD09" d="M0 0h24v16H0z" />
      <g fill="#DA121A">
        <path d="M0 1.778h24v1.778H0z" />
        <path d="M0 5.333h24v1.778H0z" />
        <path d="M0 8.889h24v1.778H0z" />
        <path d="M0 12.444h24v1.778H0z" />
      </g>
    </svg>
  );
}

export function BanderaGB({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 24 16" aria-hidden focusable="false" className={`${bandera} ${className}`}>
      <clipPath id="quarts-gb">
        <path d="M12 8 24 8 24 16Z M12 8 12 16 0 16Z M12 8 0 8 0 0Z M12 8 12 0 24 0Z" />
      </clipPath>
      <path fill="#012169" d="M0 0h24v16H0z" />
      <g fill="none">
        <path stroke="#FFFFFF" strokeWidth="3.2" d="M0 0 24 16M24 0 0 16" />
        <path stroke="#C8102E" strokeWidth="1.6" clipPath="url(#quarts-gb)" d="M0 0 24 16M24 0 0 16" />
        <path stroke="#FFFFFF" strokeWidth="5.333" d="M12 0v16M0 8h24" />
        <path stroke="#C8102E" strokeWidth="3.2" d="M12 0v16M0 8h24" />
      </g>
    </svg>
  );
}
