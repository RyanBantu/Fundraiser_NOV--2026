import type { ItemId } from "@/lib/menu";

/** Illustrated fallbacks used when a food photo isn't in /public/img. */

function Steam({ x, y }: { x: number; y: number }) {
  return (
    <g fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.85}>
      <path className="steam" d={`M${x} ${y} q-10 -16 0 -32 q10 -16 0 -32`} />
      <path className="steam" style={{ animationDelay: "0.8s" }} d={`M${x + 30} ${y + 6} q-10 -16 0 -32 q10 -16 0 -32`} />
      <path className="steam" style={{ animationDelay: "1.6s" }} d={`M${x - 30} ${y + 6} q-10 -16 0 -32 q10 -16 0 -32`} />
    </g>
  );
}

function Plate({ potatoes = true }: { potatoes?: boolean }) {
  return (
    <g>
      <ellipse cx={200} cy={222} rx={170} ry={46} fill="#2a1e16" opacity={0.12} />
      <ellipse cx={200} cy={200} rx={170} ry={72} fill="#fffdf8" stroke="#e6d8bf" strokeWidth={3} />
      <ellipse cx={200} cy={198} rx={128} ry={52} fill="#f7efe0" />
      {/* potatoes */}
      {potatoes && [
        [262, 196, 30, 22, -12],
        [292, 178, 26, 20, 18],
        [236, 214, 26, 18, 8],
        [288, 214, 24, 17, -20],
        [252, 174, 22, 17, 30],
      ].map(([cx, cy, rx, ry, r], i) => (
        <g key={i} transform={`rotate(${r} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#e7b450" />
          <ellipse cx={cx - rx * 0.25} cy={cy - ry * 0.3} rx={rx * 0.45} ry={ry * 0.3} fill="#f5d68a" />
          <circle cx={cx + rx * 0.35} cy={cy + ry * 0.2} r={3} fill="#b8792a" />
        </g>
      ))}
      {/* chicken leg (centred and a little larger when it's on its own) */}
      <g transform={potatoes ? "rotate(-18 160 190)" : "translate(-30 -30) scale(1.15) rotate(-18 160 190)"}>
        <rect x={196} y={182} width={46} height={14} rx={7} fill="#f3e6cf" />
        <circle cx={244} cy={182} r={10} fill="#f3e6cf" />
        <circle cx={246} cy={196} r={10} fill="#f3e6cf" />
        <ellipse cx={150} cy={190} rx={62} ry={40} fill="#a24a1f" />
        <ellipse cx={142} cy={180} rx={46} ry={24} fill="#c4642b" />
        <g stroke="#5b2410" strokeWidth={6} strokeLinecap="round" opacity={0.75}>
          <path d="M112 172 L132 208" />
          <path d="M138 160 L160 214" />
          <path d="M166 160 L186 204" />
        </g>
      </g>
      {/* herbs */}
      {[
        [178, 160],
        [214, 170],
        [130, 222],
        [272, 160],
        [300, 200],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#4f8a3c" />
      ))}
      <Steam x={160} y={120} />
    </g>
  );
}

function Glass({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={200} cy={268} rx={70} ry={12} fill="#2a1e16" opacity={0.12} />
      {/* straw */}
      <path d="M214 40 L232 10 L244 14 L228 44 Z" fill="#c8552d" />
      <rect x={210} y={40} width={12} height={150} rx={4} fill="#c8552d" transform="rotate(8 216 115)" />
      {/* glass */}
      <path d="M140 50 L260 50 L246 262 Q244 270 236 270 L164 270 Q156 270 154 262 Z" fill="#ffffff" opacity={0.55} stroke="#d9c7a8" strokeWidth={3} />
      <path d="M146 92 L254 92 L246 258 Q244 264 236 264 L164 264 Q156 264 154 258 Z" fill="#7a2f17" />
      <path d="M146 92 L254 92 L252 112 L148 112 Z" fill="#f1d9b5" opacity={0.9} />
      {/* ice */}
      <rect x={160} y={110} width={34} height={34} rx={6} fill="#fff" opacity={0.45} transform="rotate(-12 177 127)" />
      <rect x={200} y={128} width={30} height={30} rx={6} fill="#fff" opacity={0.4} transform="rotate(14 215 143)" />
      {/* bubbles */}
      {[
        [170, 200, 4],
        [190, 230, 3],
        [222, 190, 5],
        [234, 236, 3],
        [182, 168, 3],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" opacity={0.6} />
      ))}
      {/* lime */}
      <circle cx={256} cy={60} r={26} fill="#9cc64b" />
      <circle cx={256} cy={60} r={20} fill="#d7ea9a" />
      <path d="M256 40 V80 M236 60 H276 M242 46 L270 74 M270 46 L242 74" stroke="#9cc64b" strokeWidth={2} />
      {/* highlight */}
      <path d="M156 70 L166 240" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
    </g>
  );
}

export function FoodArt({ id, className }: { id: ItemId; className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label={`Illustration of ${id}`}>
      {id === "plate" && <Plate />}
      {id === "extra" && (
        <g>
          <Plate potatoes={false} />
          <g transform="translate(296 92)">
            <circle r={34} fill="#c8552d" />
            <text y={12} textAnchor="middle" fontSize={34} fontWeight={800} fill="#fff" fontFamily="sans-serif">
              +1
            </text>
          </g>
        </g>
      )}
      {id === "drink" && <Glass />}
      {id === "combo" && (
        <g>
          <g transform="translate(-40 20) scale(0.9)">
            <Plate />
          </g>
          <Glass x={130} y={30} s={0.88} />
        </g>
      )}
    </svg>
  );
}
