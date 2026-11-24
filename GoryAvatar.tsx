// Dessin animé de Gory, version réaliste (SVG).
// Le visage reste identique pour tous : seuls le pelage, les yeux, la tenue
// et les accessoires changent. Mêmes « props » que la version précédente.

import { useId, type CSSProperties } from 'react';
import { BOTTOM_STYLES, EYE_COLORS, FUR_SHADES, type GoryLook } from './catalog';
import { STAGES, type StageId } from './progression';
import './gory.css';

export type GoryMood = 'idle' | 'sleeping' | 'waking' | 'wave' | 'celebrate';

interface Props {
  look: GoryLook;
  stage?: StageId;
  mood?: GoryMood;
  glow?: boolean; // yeux illuminés (récompense)
  size?: number;
  onClick?: () => void;
  title?: string;
}

const SKIN = '#4a3d38';
const SKIN_DARK = '#2a221f';
const SKIN_LIGHT = '#6b5a52';
const EYES_X = [85, 115];
const EYE_Y = 87;

/** Éclaircit (f > 0) ou assombrit (f < 0) une couleur hexadécimale. */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const t = f < 0 ? 0 : 255;
  const p = Math.abs(f);
  const ch = (c: number) => Math.round((t - c) * p + c);
  return `rgb(${ch(n >> 16)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}

function rgbFractions(hex: string, lighten: number): number[] {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255].map((c) => +(((255 - c) * lighten + c) / 255).toFixed(3));
}

export default function GoryAvatar({ look, stage = 'bebe', mood = 'idle', glow = false, size = 260, onClick, title }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const fur = FUR_SHADES[look.fur] ?? FUR_SHADES.fur_noir;
  const eye = EYE_COLORS[look.eyes] ?? EYE_COLORS.eyes_ambre;
  const bottom = BOTTOM_STYLES[look.bottom] ?? BOTTOM_STYLES.bottom_short_rouge;
  const scale = STAGES.find((s) => s.id === stage)?.scale ?? 0.78;
  const adult = stage === 'guerrier' || stage === 'legendaire';
  // Un bébé a une tête plus grosse par rapport à son corps
  const headTransform = stage === 'bebe' ? 'translate(100 124) scale(1.16) translate(-100 -124)' : stage === 'jeune' ? 'translate(100 124) scale(1.07) translate(-100 -124)' : undefined;
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  const classes = ['gory', `gory--${mood}`, glow ? 'gory--glow' : '', onClick ? 'gory--clickable' : ''].join(' ');
  const furDark = shade(fur.base, -0.45);
  const hl = rgbFractions(fur.light, 0.35); // reflets du pelage

  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      className={classes}
      role="img"
      aria-label={title ?? 'Gory'}
      onClick={onClick}
      style={{ '--gory-eye': eye } as CSSProperties}
    >
      <defs>
        {/* Pelage : contours ébouriffés + mèches verticales */}
        <filter id={id('fur')} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="fuzzy" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.07" numOctaves="2" seed="3" result="strands" />
          <feColorMatrix in="strands" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.62" result="strandsDark" />
          <feComposite in="strandsDark" in2="fuzzy" operator="in" result="strandsIn" />
          <feTurbulence type="fractalNoise" baseFrequency="1.1 0.09" numOctaves="2" seed="11" result="shine" />
          <feColorMatrix in="shine" type="matrix" values={`0 0 0 0 ${hl[0]}  0 0 0 0 ${hl[1]}  0 0 0 0 ${hl[2]}  0.9 0 0 0 -0.64`} result="shineLight" />
          <feComposite in="shineLight" in2="fuzzy" operator="in" result="shineIn" />
          <feMerge>
            <feMergeNode in="fuzzy" />
            <feMergeNode in="strandsIn" />
            <feMergeNode in="shineIn" />
          </feMerge>
        </filter>
        {/* Peau : grain léger */}
        <filter id={id('skin')}>
          <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="1" seed="5" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.5 0 0 0 -0.2" result="ga" />
          <feComposite in="ga" in2="SourceGraphic" operator="in" result="gin" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="gin" />
          </feMerge>
        </filter>
        <filter id={id('glow')} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={id('soft')}>
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <radialGradient id={id('furGrad')} cx="45%" cy="30%" r="75%">
          <stop offset="0%" stopColor={shade(fur.light, 0.08)} />
          <stop offset="45%" stopColor={fur.base} />
          <stop offset="100%" stopColor={furDark} />
        </radialGradient>
        <radialGradient id={id('headGrad')} cx="50%" cy="25%" r="80%">
          <stop offset="0%" stopColor={fur.light} />
          <stop offset="55%" stopColor={fur.base} />
          <stop offset="100%" stopColor={furDark} />
        </radialGradient>
        <linearGradient id={id('armGrad')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fur.base} />
          <stop offset="100%" stopColor={furDark} />
        </linearGradient>
        <radialGradient id={id('skinGrad')} cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor={SKIN_LIGHT} />
          <stop offset="70%" stopColor={SKIN} />
          <stop offset="100%" stopColor={SKIN_DARK} />
        </radialGradient>
        <radialGradient id={id('aura')}>
          <stop offset="55%" stopColor="#f5c542" stopOpacity="0" />
          <stop offset="80%" stopColor="#f5c542" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f5c542" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ombre au sol */}
      <ellipse cx="100" cy="236" rx={66 * scale} ry="5" fill="#000" opacity="0.45" filter={url('soft')} />

      <g transform={`translate(100 236) scale(${scale}) translate(-100 -236)`}>
        <g className="gory-body-anim">
          {stage === 'legendaire' && <circle className="gory-aura" cx="100" cy="128" r="106" fill={url('aura')} />}

          {/* ---------- pelage ---------- */}
          {/* bras gauche : long, appuyé sur les phalanges */}
          <g className="gory-arm-left">
            <path filter={url('fur')} d="M58 116 Q30 124 27 166 Q25 200 31 222 L57 224 Q58 192 64 160 Z" fill={url('armGrad')} />
            <ellipse cx="44" cy="225" rx="15" ry="8" fill={SKIN} />
            <path d="M34 223 v5 M40 222 v6 M46 222 v6 M52 223 v5" stroke={SKIN_DARK} strokeWidth="1.2" strokeLinecap="round" />
          </g>
          {/* jambes */}
          <g filter={url('fur')}>
            <ellipse cx="74" cy="219" rx="23" ry="15" fill={furDark} />
            <ellipse cx="126" cy="219" rx="23" ry="15" fill={furDark} />
            {/* corps */}
            <path d="M46 132 Q50 104 100 100 Q150 104 154 132 Q160 178 142 210 Q100 226 58 210 Q40 178 46 132 Z" fill={url('furGrad')} />
          </g>
          {/* lumière de contour (détache Gory du fond noir) */}
          <path d="M50 128 Q54 106 100 103 Q146 106 150 128" stroke={fur.light} strokeOpacity="0.35" strokeWidth="3" fill="none" filter={url('soft')} />
          {/* bras droit (celui qui fait coucou) */}
          <g className="gory-arm-right">
            <path filter={url('fur')} d="M142 116 Q170 124 173 166 Q175 200 169 222 L143 224 Q142 192 136 160 Z" fill={url('armGrad')} />
            <ellipse cx="156" cy="225" rx="15" ry="8" fill={SKIN} />
            <path d="M148 223 v5 M154 222 v6 M160 222 v6 M166 223 v5" stroke={SKIN_DARK} strokeWidth="1.2" strokeLinecap="round" />
          </g>
          {/* tête (crête plus marquée chez l'adulte) */}
          <path
            transform={headTransform}
            filter={url('fur')}
            d={adult ? 'M56 94 Q50 54 92 34 Q100 24 108 34 Q150 54 144 94 Q140 126 100 130 Q60 126 56 94 Z' : 'M56 94 Q50 48 100 40 Q150 48 144 94 Q140 126 100 130 Q60 126 56 94 Z'}
            fill={url('headGrad')}
          />

          {/* poitrine nue chez l'adulte */}
          {adult && <path d="M76 128 Q100 120 124 128 Q122 156 100 160 Q78 156 76 128 Z" fill={url('skinGrad')} filter={url('skin')} opacity="0.95" />}

          {/* emblème pilule (à partir de Gory guerrier) */}
          {adult && (
            <g transform="rotate(-30 100 178)">
              <rect x="88" y="172" width="24" height="11" rx="5.5" fill="#1e8bff" />
              <path d="M93.5 172 H100 V183 H93.5 A5.5 5.5 0 0 1 93.5 172 Z" fill="#e3262f" />
            </g>
          )}

          {/* short ou pantalon */}
          {bottom.long ? (
            <path d="M52 190 Q100 206 148 190 L150 230 L108 230 L100 210 L92 230 L50 230 Z" fill={bottom.color} />
          ) : (
            <path d="M52 190 Q100 206 148 190 L147 214 L106 216 L100 204 L94 216 L53 214 Z" fill={bottom.color} />
          )}
          <path d="M53 192 Q100 208 147 192" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" fill="none" />
          <path d="M53 200 Q100 214 147 200" stroke="#000000" strokeOpacity="0.18" strokeWidth="6" fill="none" />

          {/* pieds */}
          <ellipse cx="70" cy="232" rx="17" ry="6" fill={SKIN} />
          <ellipse cx="130" cy="232" rx="17" ry="6" fill={SKIN} />

          <g transform={headTransform}>
          {/* oreilles */}
          <ellipse cx="57" cy="94" rx="7" ry="9" fill={SKIN} />
          <ellipse cx="143" cy="94" rx="7" ry="9" fill={SKIN} />

          {/* ---------- visage officiel (identique pour tous) ---------- */}
          <g filter={url('skin')}>
            <path d="M64 80 Q100 66 136 80 Q142 104 130 118 Q118 132 100 132 Q82 132 70 118 Q58 104 64 80 Z" fill={url('skinGrad')} />
          </g>

          {/* yeux enfoncés */}
          {EYES_X.map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={EYE_Y} rx="9" ry="7" fill={SKIN_DARK} opacity="0.7" />
              <circle className="gory-eye-glow" cx={cx} cy={EYE_Y} r="9" fill={eye} filter={url('glow')} />
              <ellipse cx={cx} cy={EYE_Y} rx="5.8" ry="4.9" fill="#d9ccbc" />
              <circle className="gory-iris" cx={cx} cy={EYE_Y + 0.3} r="4.1" fill={eye} />
              <circle cx={cx} cy={EYE_Y + 0.3} r="4.1" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="1" />
              <circle cx={cx} cy={EYE_Y + 0.3} r="2.1" fill="#0b0b0b" />
              <circle cx={cx + 1.6} cy={EYE_Y - 1.6} r="1.3" fill="#ffffff" />
              <ellipse className="gory-lid" cx={cx} cy={EYE_Y} rx="7" ry="6.3" fill={SKIN} />
            </g>
          ))}

          {/* arcade sourcilière proéminente */}
          <path d="M62 80 Q80 66 100 74 Q120 66 138 80 Q132 88 116 81 Q100 78 84 81 Q68 88 62 80 Z" fill={SKIN_DARK} />
          <path d="M66 78 Q82 70 100 76 Q118 70 134 78" stroke={SKIN_LIGHT} strokeOpacity="0.45" strokeWidth="1.5" fill="none" />

          {/* nez large aux narines évasées */}
          <path d="M94 90 Q100 88 106 90 L110 100 Q116 104 113 110 Q100 114 87 110 Q84 104 90 100 Z" fill={SKIN_LIGHT} opacity="0.85" />
          <path d="M96 91 Q94 98 91 102 M104 91 Q106 98 109 102" stroke={SKIN_DARK} strokeOpacity="0.5" strokeWidth="1" fill="none" />
          <ellipse cx="94" cy="107" rx="4" ry="2.6" transform="rotate(-18 94 107)" fill="#120d0b" />
          <ellipse cx="106" cy="107" rx="4" ry="2.6" transform="rotate(18 106 107)" fill="#120d0b" />

          {/* bouche */}
          {mood === 'celebrate' || mood === 'wave' ? (
            <g>
              <path d="M84 117 Q100 132 116 117 Q100 122 84 117 Z" fill="#1a1210" />
              <path d="M90 119 Q100 122 110 119" stroke="#e8e0d4" strokeWidth="2" fill="none" />
            </g>
          ) : (
            <path d="M84 118 Q100 124 116 118" stroke="#1a1210" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          )}
          <path d="M90 125 Q100 128 110 125" stroke={SKIN_DARK} strokeOpacity="0.6" strokeWidth="1.2" fill="none" />

          <Glasses id={look.glasses} />
          <Headwear id={look.headwear} />
          </g>
        </g>
      </g>
    </svg>
  );
}

function Glasses({ id }: { id: string }) {
  const [l, r] = EYES_X;
  if (id === 'glasses_rondes' || id === 'glasses_bleues') {
    const color = id === 'glasses_bleues' ? '#1e8bff' : '#111111';
    const lens = id === 'glasses_bleues' ? 0.3 : 0.06;
    return (
      <g stroke={color} strokeWidth="2.4" fill="none">
        <circle cx={l} cy={EYE_Y} r="11" fill="#9fd0ff" fillOpacity={lens} />
        <circle cx={r} cy={EYE_Y} r="11" fill="#9fd0ff" fillOpacity={lens} />
        <path d={`M96 ${EYE_Y - 1} Q100 ${EYE_Y - 4} 104 ${EYE_Y - 1}`} />
        <path d={`M74 ${EYE_Y - 2} L58 90 M126 ${EYE_Y - 2} L142 90`} />
      </g>
    );
  }
  if (id === 'glasses_carrees_rouges') {
    return (
      <g stroke="#e3262f" strokeWidth="2.8" fill="#ffffff" fillOpacity="0.06">
        <rect x="72" y={EYE_Y - 9} width="26" height="18" rx="3.5" />
        <rect x="102" y={EYE_Y - 9} width="26" height="18" rx="3.5" />
        <path d={`M98 ${EYE_Y - 3} H102 M72 ${EYE_Y - 3} L58 90 M128 ${EYE_Y - 3} L142 90`} fill="none" />
      </g>
    );
  }
  return null;
}

function Headwear({ id }: { id: string }) {
  if (id === 'headwear_casquette_rouge' || id === 'headwear_casquette_bleue') {
    const c = id === 'headwear_casquette_rouge' ? '#d81f2a' : '#1565e0';
    return (
      <g>
        <path d="M58 70 Q58 34 100 32 Q142 34 142 70 Z" fill={c} />
        <path d="M70 66 Q72 40 100 36" stroke="#000" strokeOpacity="0.18" strokeWidth="5" fill="none" />
        <path d="M58 68 Q100 61 142 68 L170 75 Q150 80 132 74 Q100 69 58 72 Z" fill={shade(c, -0.25)} />
        <circle cx="100" cy="34" r="3.5" fill={shade(c, -0.25)} />
      </g>
    );
  }
  if (id === 'headwear_bandeau_rouge') {
    return (
      <g fill="#e3262f">
        <path d="M56 62 Q100 42 144 62 L144 71 Q100 51 56 71 Z" />
        <path d="M142 63 L162 55 L158 68 Z" />
        <path d="M142 67 L160 76 L150 80 Z" />
      </g>
    );
  }
  if (id === 'headwear_noeud_bleu') {
    return (
      <g fill="#1e8bff">
        <path d="M128 52 L114 42 L114 62 Z" />
        <path d="M128 52 L142 42 L142 62 Z" />
        <circle cx="128" cy="52" r="4.5" />
      </g>
    );
  }
  return null;
}
