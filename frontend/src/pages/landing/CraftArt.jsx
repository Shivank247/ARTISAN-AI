/*
 * Hand-built SVG artwork used by the landing page:
 * - HeroPoster: static still life shown while the 3D scene loads and
 *   whenever WebGL is unavailable or the user prefers saved data.
 * - Category illustrations: one consistent mark per craft family.
 *
 * All colours come from the ARTISAN AI palette.
 */

const C = {
  forest: "#20382e",
  sage: "#315344",
  cream: "#f2eddf",
  terracotta: "#b96749",
  deep: "#965039",
  brass: "#b89559",
  charcoal: "#343a32",
  wood: "#7b4a2c",
  clay: "#a85a3e",
};

export function HeroPoster() {
  return (
    <svg
      className="hero-poster"
      viewBox="0 0 600 520"
      role="img"
      aria-label="Illustration of a handmade terracotta vase, clay pot, brass vessel, woven textiles and a carved wooden box on a stone plinth"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id="poster-vase-clip">
          <path d="M202 420 C160 400 150 330 150 300 C150 250 205 225 208 175 C208 160 190 150 182 138 L298 138 C290 150 272 160 272 175 C275 225 330 250 330 300 C330 330 320 400 278 420 Z" />
        </clipPath>
        <linearGradient id="poster-brass" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8d7041" />
          <stop offset="0.35" stopColor="#e0c88c" />
          <stop offset="0.7" stopColor="#b89559" />
          <stop offset="1" stopColor="#7a5f35" />
        </linearGradient>
        <linearGradient id="poster-cloth-a" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={C.forest} />
          <stop offset="0.25" stopColor={C.forest} />
          <stop offset="0.25" stopColor={C.cream} />
          <stop offset="0.4" stopColor={C.cream} />
          <stop offset="0.4" stopColor={C.terracotta} />
          <stop offset="0.65" stopColor={C.terracotta} />
          <stop offset="0.65" stopColor={C.brass} />
          <stop offset="0.72" stopColor={C.brass} />
          <stop offset="0.72" stopColor={C.cream} />
          <stop offset="1" stopColor={C.cream} />
        </linearGradient>
        <linearGradient id="poster-cloth-b" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={C.terracotta} />
          <stop offset="0.3" stopColor={C.terracotta} />
          <stop offset="0.3" stopColor={C.cream} />
          <stop offset="0.5" stopColor={C.cream} />
          <stop offset="0.5" stopColor={C.sage} />
          <stop offset="0.8" stopColor={C.sage} />
          <stop offset="0.8" stopColor={C.brass} />
          <stop offset="1" stopColor={C.brass} />
        </linearGradient>
      </defs>

      {/* Plinth */}
      <ellipse cx="300" cy="452" rx="262" ry="58" fill="#1a2f26" opacity="0.55" />
      <ellipse cx="300" cy="432" rx="250" ry="54" fill="#e6dec9" />
      <ellipse cx="300" cy="426" rx="250" ry="54" fill="none" stroke={C.brass} strokeWidth="3" />

      {/* Brass lota */}
      <path
        d="M88 420 L138 420 C152 400 142 385 156 360 C170 335 152 322 137 314 L140 296 C152 291 152 285 146 283 L80 283 C74 285 74 291 86 296 L89 314 C74 322 56 335 70 360 C84 385 74 400 88 420 Z"
        fill="url(#poster-brass)"
      />

      {/* Terracotta vase */}
      <path
        d="M202 420 C160 400 150 330 150 300 C150 250 205 225 208 175 C208 160 190 150 182 138 L298 138 C290 150 272 160 272 175 C275 225 330 250 330 300 C330 330 320 400 278 420 Z"
        fill={C.terracotta}
      />
      <g clipPath="url(#poster-vase-clip)">
        <rect x="140" y="142" width="200" height="8" fill={C.deep} />
        <path
          d="M140 192 l12 -16 12 16 12 -16 12 16 12 -16 12 16 12 -16 12 16 12 -16 12 16 12 -16 12 16 12 -16 12 16 12 -16 12 16"
          fill="none"
          stroke={C.deep}
          strokeWidth="4"
        />
        {[170, 202, 234, 266, 298].map((x) => (
          <g key={x}>
            <path d={`M${x} 300 l16 -28 16 28 -16 28 z`} fill={C.deep} />
            <path d={`M${x + 16} 289 l8 11 -8 11 -8 -11 z`} fill={C.cream} />
          </g>
        ))}
        <rect x="140" y="372" width="200" height="5" fill={C.deep} />
        <rect x="140" y="204" width="200" height="14" fill="none" />
      </g>
      <rect x="205" y="236" width="70" height="7" rx="3" fill={C.brass} />

      {/* Clay pot */}
      <path
        d="M382 420 C357 410 342 372 352 337 C362 302 397 287 402 268 L442 268 C447 287 482 302 492 337 C502 372 487 410 462 420 Z"
        fill={C.clay}
      />
      <path d="M358 344 l16 -12 16 12 16 -12 16 12 16 -12 16 12 16 -12" fill="none" stroke={C.cream} strokeWidth="4" />
      <rect x="400" y="266" width="44" height="7" rx="3" fill={C.deep} />

      {/* Woven textiles */}
      <g>
        <rect x="150" y="440" width="170" height="14" rx="3" fill="url(#poster-cloth-b)" />
        <rect x="156" y="427" width="160" height="14" rx="3" fill="url(#poster-cloth-a)" />
        <rect x="150" y="414" width="168" height="14" rx="3" fill="url(#poster-cloth-b)" />
      </g>

      {/* Carved wooden box */}
      <g>
        <rect x="454" y="378" width="104" height="44" rx="5" fill={C.wood} />
        <rect x="448" y="358" width="116" height="24" rx="6" fill="#8d5a38" />
        <circle cx="478" cy="400" r="9" fill="none" stroke="#3a210f" strokeWidth="2" opacity="0.6" />
        <circle cx="506" cy="400" r="9" fill="none" stroke="#3a210f" strokeWidth="2" opacity="0.6" />
        <circle cx="534" cy="400" r="9" fill="none" stroke="#3a210f" strokeWidth="2" opacity="0.6" />
        <rect x="498" y="372" width="16" height="20" rx="2" fill="url(#poster-brass)" />
      </g>

      {/* Brass diya */}
      <path d="M338 448 C338 440 356 436 372 436 C388 436 400 440 400 448 C392 456 346 456 338 448 Z" fill="url(#poster-brass)" />
      <path d="M368 436 C360 424 366 414 370 408 C374 414 380 424 372 436 Z" fill="#ffb45e" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Category illustrations (200 × 200)                                  */
/* ------------------------------------------------------------------ */

function Art({ children, label }) {
  return (
    <svg
      className="category-art"
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

export function PotteryArt() {
  return (
    <Art label="Terracotta pottery illustration">
      <ellipse cx="100" cy="172" rx="58" ry="9" fill={C.forest} opacity="0.18" />
      <clipPath id="art-pottery-clip">
        <path d="M78 168 C58 160 50 128 50 112 C50 86 80 76 82 52 C82 44 74 40 70 34 L130 34 C126 40 118 44 118 52 C120 76 150 86 150 112 C150 128 142 160 122 168 Z" />
      </clipPath>
      <path
        d="M78 168 C58 160 50 128 50 112 C50 86 80 76 82 52 C82 44 74 40 70 34 L130 34 C126 40 118 44 118 52 C120 76 150 86 150 112 C150 128 142 160 122 168 Z"
        fill={C.terracotta}
      />
      <g clipPath="url(#art-pottery-clip)">
        <rect x="40" y="36" width="120" height="5" fill={C.deep} />
        <path d="M40 62 l8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10 8 10 8 -10" fill="none" stroke={C.deep} strokeWidth="2.5" />
        {[56, 78, 100, 122].map((x) => (
          <g key={x}>
            <path d={`M${x} 112 l11 -17 11 17 -11 17 z`} fill={C.deep} />
            <path d={`M${x + 11} 105 l5 7 -5 7 -5 -7 z`} fill={C.cream} />
          </g>
        ))}
        <rect x="40" y="146" width="120" height="3" fill={C.deep} />
      </g>
      <rect x="82" y="64" width="36" height="4" rx="2" fill={C.brass} />
    </Art>
  );
}

export function TextileArt() {
  const stripes = [C.forest, C.cream, C.terracotta, C.brass, C.cream, C.sage];

  return (
    <Art label="Handwoven textile illustration">
      <rect x="34" y="124" width="132" height="22" rx="3" fill={C.sage} />
      <rect x="40" y="100" width="124" height="22" rx="3" fill={C.cream} stroke={C.deep} strokeWidth="1" />
      <rect x="30" y="52" width="140" height="46" rx="3" fill={C.cream} />
      {stripes.map((color, index) => (
        <rect
          key={`${color}-${index}`}
          x={30 + index * 23.3}
          y="52"
          width={index % 2 === 0 ? 14 : 9}
          height="46"
          fill={color}
        />
      ))}
      {Array.from({ length: 15 }, (_, index) => (
        <line
          key={index}
          x1={36 + index * 9}
          y1="98"
          x2={36 + index * 9}
          y2="108"
          stroke={C.cream}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <path d="M30 62 H170 M30 74 H170 M30 86 H170" stroke={C.charcoal} strokeOpacity="0.12" strokeWidth="1" />
    </Art>
  );
}

export function WoodworkArt() {
  const rosette = (cx, cy) => (
    <g key={`${cx}-${cy}`} fill="none" stroke="#3a210f" strokeOpacity="0.75" strokeWidth="2">
      <circle cx={cx} cy={cy} r="20" />
      <circle cx={cx} cy={cy} r="7" fill="#3a210f" fillOpacity="0.5" />
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <line
            key={index}
            x1={cx + Math.cos(angle) * 7}
            y1={cy + Math.sin(angle) * 7}
            x2={cx + Math.cos(angle) * 20}
            y2={cy + Math.sin(angle) * 20}
          />
        );
      })}
    </g>
  );

  return (
    <Art label="Carved wooden panel illustration">
      <rect x="28" y="40" width="144" height="120" rx="8" fill={C.wood} />
      <rect x="36" y="48" width="128" height="104" rx="4" fill="none" stroke="#3a210f" strokeOpacity="0.6" strokeWidth="2" />
      {[
        [68, 82],
        [132, 82],
        [68, 128],
        [132, 128],
      ].map(([cx, cy]) => rosette(cx, cy))}
      <circle cx="100" cy="105" r="9" fill={C.brass} />
      <circle cx="100" cy="105" r="3.5" fill={C.wood} />
    </Art>
  );
}

export function MetalArt() {
  return (
    <Art label="Brass vessel illustration">
      <defs>
        <linearGradient id="art-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#8d7041" />
          <stop offset="0.35" stopColor="#e6d29a" />
          <stop offset="0.7" stopColor={C.brass} />
          <stop offset="1" stopColor="#7a5f35" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="172" rx="50" ry="8" fill={C.forest} opacity="0.18" />
      <path
        d="M72 166 L128 166 C142 148 132 134 146 112 C160 90 142 78 126 70 L128 52 C140 47 140 40 134 38 L66 38 C60 40 60 47 72 52 L74 70 C58 78 40 90 54 112 C68 134 58 148 72 166 Z"
        fill="url(#art-brass)"
      />
      <path d="M62 108 C80 116 120 116 138 108" fill="none" stroke="#7a5f35" strokeWidth="2" />
      <path d="M64 124 C82 132 118 132 136 124" fill="none" stroke="#7a5f35" strokeWidth="2" />
    </Art>
  );
}

export function PaintingArt() {
  return (
    <Art label="Folk painting illustration">
      <rect x="30" y="30" width="140" height="140" rx="4" fill={C.brass} />
      <rect x="38" y="38" width="124" height="124" fill={C.cream} />
      <circle cx="100" cy="92" r="24" fill={C.terracotta} />
      <circle cx="100" cy="92" r="11" fill={C.cream} />
      {Array.from({ length: 16 }, (_, index) => {
        const angle = (index / 16) * Math.PI * 2;
        return (
          <line
            key={index}
            x1={100 + Math.cos(angle) * 30}
            y1={92 + Math.sin(angle) * 30}
            x2={100 + Math.cos(angle) * 40}
            y2={92 + Math.sin(angle) * 40}
            stroke={C.deep}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <path d="M52 146 q12 -18 24 0 q12 -18 24 0 q12 -18 24 0 q12 -18 24 0" fill="none" stroke={C.sage} strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, index) => (
        <circle key={index} cx={50 + index * 12.5} cy="154" r="2" fill={C.forest} />
      ))}
    </Art>
  );
}

export function JewelleryArt() {
  const jhumka = (cx) => (
    <g key={cx}>
      <circle cx={cx} cy="52" r="5" fill={C.brass} />
      <path d={`M${cx - 22} 98 A22 22 0 0 1 ${cx + 22} 98 Z`} fill={C.brass} />
      <path d={`M${cx - 14} 98 L${cx - 20} 126 L${cx + 20} 126 L${cx + 14} 98 Z`} fill={C.terracotta} />
      <path d={`M${cx - 20} 126 H${cx + 20}`} stroke={C.brass} strokeWidth="3" />
      {[-14, -5, 5, 14].map((dx) => (
        <circle key={dx} cx={cx + dx} cy="134" r="3.4" fill={C.brass} />
      ))}
      <circle cx={cx} cy="96" r="3" fill={C.cream} />
    </g>
  );

  return (
    <Art label="Jewellery illustration">
      {jhumka(66)}
      {jhumka(134)}
      <path d="M44 156 Q100 196 156 156" fill="none" stroke={C.brass} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
      <path d="M44 156 Q100 196 156 156" fill="none" stroke={C.terracotta} strokeWidth="1.5" />
    </Art>
  );
}
