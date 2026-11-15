export type PendantKind = "cross" | "fish";
export type HairStyle = "short" | "long" | "curly" | "bun";

export interface ModelLook {
  name: string;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  collar?: string;
  beard?: boolean;
  pendant: PendantKind;
}

/** Illustrated models used on the monitor to show the pendants being worn. */
export const MODELS: ModelLook[] = [
  { name: "Grace", skin: "#c68a62", hair: "#2b1a12", hairStyle: "long", shirt: "#3f6b5a", pendant: "cross" },
  { name: "Daniel", skin: "#8d5a3b", hair: "#1b120d", hairStyle: "short", shirt: "#f1e4cc", collar: "#e2d1b1", beard: true, pendant: "cross" },
  { name: "Ruth", skin: "#e2b392", hair: "#5a3420", hairStyle: "bun", shirt: "#b85a3a", pendant: "cross" },
  { name: "Samuel", skin: "#6b4029", hair: "#120c08", hairStyle: "curly", shirt: "#2f4a6d", pendant: "fish" },
  { name: "Esther", skin: "#d39b74", hair: "#3a2216", hairStyle: "long", shirt: "#7a4b6b", pendant: "fish" },
];

export const CROSS_MODELS = MODELS.filter((m) => m.pendant === "cross");
export const FISH_MODELS = MODELS.filter((m) => m.pendant === "fish");

function CrossPendant() {
  return (
    <g>
      <circle cx={0} cy={2} r={3.2} fill="none" stroke="#c9a24a" strokeWidth={1.6} />
      <g transform="translate(0 5)">
        <rect x={-4.8} y={0} width={9.6} height={32} rx={1.4} fill="#151515" />
        <rect x={-12.5} y={8} width={25} height={8.6} rx={1.4} fill="#151515" />
        {/* printed-layer sheen */}
        <rect x={-3.2} y={1.5} width={2} height={29} rx={1} fill="#4a4a55" opacity={0.7} />
        <rect x={-11} y={9.6} width={22} height={1.8} rx={0.9} fill="#4a4a55" opacity={0.7} />
      </g>
    </g>
  );
}

function FishPendant() {
  return (
    <g>
      <circle cx={0} cy={2} r={3.2} fill="none" stroke="#c9a24a" strokeWidth={1.6} />
      <g transform="translate(0 6)">
        <path
          d="M-22 9 C-12 -2 8 -2 16 9 L24 1 M-22 9 C-12 20 8 20 16 9 L24 17"
          fill="none"
          stroke="#ffffff"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M-22 9 C-12 -2 8 -2 16 9 L24 1 M-22 9 C-12 20 8 20 16 9 L24 17"
          fill="none"
          stroke="#d9cbb5"
          strokeWidth={0.8}
          strokeLinecap="round"
          opacity={0.8}
        />
        <text x={-3} y={11.4} textAnchor="middle" fontSize={6.4} fontWeight={800} fill="#ffffff" fontFamily="sans-serif" letterSpacing={0.2}>
          JESUS
        </text>
      </g>
    </g>
  );
}

export function ModelArt({ look, className, glow = true }: { look: ModelLook; className?: string; glow?: boolean }) {
  const { skin, hair, hairStyle, shirt, collar, beard, pendant } = look;
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={`${look.name} wearing the ${pendant} pendant`}>
      {/* hair behind the head */}
      {hairStyle === "long" && <path d="M60 92 C52 36 148 36 140 92 L150 176 C128 186 72 186 50 176 Z" fill={hair} />}
      {hairStyle === "curly" &&
        [
          [70, 70],
          [84, 52],
          [102, 46],
          [120, 52],
          [134, 70],
          [64, 90],
          [138, 90],
        ].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={20} fill={hair} />)}

      {/* torso */}
      <path d="M14 240 C14 188 54 164 100 164 C146 164 186 188 186 240 Z" fill={shirt} />
      {/* neck */}
      <path d="M84 116 L84 168 Q100 180 116 168 L116 116 Z" fill={skin} />
      <path d="M84 132 Q100 146 116 132 L116 140 Q100 154 84 140 Z" fill="#000" opacity={0.12} />
      {/* open neckline so the pendant sits on skin */}
      <path d="M66 168 Q100 226 134 168 Q100 180 66 168 Z" fill={skin} />
      {collar && (
        <g fill={collar}>
          <path d="M64 166 L82 166 L92 196 L70 184 Z" />
          <path d="M136 166 L118 166 L108 196 L130 184 Z" />
        </g>
      )}

      {/* head */}
      <ellipse cx={66} cy={98} rx={6} ry={9} fill={skin} />
      <ellipse cx={134} cy={98} rx={6} ry={9} fill={skin} />
      <ellipse cx={100} cy={94} rx={34} ry={40} fill={skin} />

      {beard && (
        <path d="M67 100 C68 134 86 142 100 142 C114 142 132 134 133 100 C126 118 116 124 100 124 C84 124 74 118 67 100 Z" fill={hair} />
      )}

      {/* face */}
      <g fill="none" stroke="#2a1e16" strokeWidth={2.4} strokeLinecap="round">
        <path d="M83 96 q6 5 12 0" />
        <path d="M105 96 q6 5 12 0" />
        <path d={beard ? "M91 116 q9 6 18 0" : "M90 113 q10 8 20 0"} stroke={beard ? "#f3d9c7" : "#2a1e16"} />
      </g>
      {!beard && (
        <g fill="#e5737a" opacity={0.28}>
          <circle cx={80} cy={108} r={6} />
          <circle cx={120} cy={108} r={6} />
        </g>
      )}

      {/* hair on top */}
      {hairStyle === "short" && (
        <path d="M64 94 C58 50 92 44 104 48 C126 46 144 62 136 94 C130 76 118 68 100 68 C84 68 72 76 64 94 Z" fill={hair} />
      )}
      {hairStyle === "long" && (
        <path d="M64 98 C56 50 94 42 102 52 C112 42 148 54 136 98 C128 74 114 64 102 60 C96 70 82 80 64 98 Z" fill={hair} />
      )}
      {hairStyle === "curly" &&
        [
          [76, 66],
          [92, 58],
          [108, 58],
          [124, 66],
        ].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={13} fill={hair} />)}
      {hairStyle === "bun" && (
        <g fill={hair}>
          <circle cx={100} cy={46} r={16} />
          <path d="M64 96 C60 54 90 50 100 52 C112 50 142 56 136 96 C130 74 116 66 100 66 C84 66 70 74 64 96 Z" />
        </g>
      )}

      {/* chain */}
      <path
        d="M84 144 C86 176 94 192 100 194 C106 192 114 176 116 144"
        fill="none"
        stroke="#c9a24a"
        strokeWidth={1.7}
        strokeDasharray="2.4 1.4"
      />
      {/* pendant */}
      <g transform="translate(100 192)">
        {glow && <circle className="shine" cx={0} cy={pendant === "cross" ? 22 : 14} r={22} fill="#f6d27a" opacity={0} />}
        <g className="sway">{pendant === "cross" ? <CrossPendant /> : <FishPendant />}</g>
      </g>
    </svg>
  );
}
