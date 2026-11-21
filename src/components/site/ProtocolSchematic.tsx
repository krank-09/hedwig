const node = "fill-card stroke-[1.5]";
const sharedWire = "M60 150 H152 q6 -18 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 H260";
const wires = [
  { id: "wire-bob", d: `${sharedWire} L340 80`, begin: "0s" },
  { id: "wire-charlie", d: `${sharedWire} L340 220`, begin: "2s" },
];

export function ProtocolSchematic() {
  return (
    <figure className="hero-figure min-w-0">
      <svg
        viewBox="0 0 400 300"
        className="h-auto w-full font-mono"
        role="img"
        aria-labelledby="schematic-title"
      >
        <title id="schematic-title">
          Protocol schematic: Alice sends a token through a noisy channel to Bob and Charlie.
        </title>
        <defs>
          <linearGradient id="wire-stroke" gradientUnits="userSpaceOnUse" x1="150" x2="250">
            <stop offset="0" className="[stop-color:var(--color-border)]" />
            <stop offset="0" className="[stop-color:var(--color-quantum)]" />
            <stop offset="1" className="[stop-color:var(--color-quantum)]" />
            <stop offset="1" className="[stop-color:var(--color-border)]" />
          </linearGradient>
        </defs>
        <rect
          x="150"
          y="122"
          width="100"
          height="56"
          rx="4"
          className="fill-surface-raised stroke-border"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <g fill="none" stroke="url(#wire-stroke)" strokeWidth="1.5">
          {wires.map(({ id, d }) => (
            <path key={id} id={id} d={d} />
          ))}
        </g>
        <text x="200" y="198" textAnchor="middle" className="fill-muted-foreground text-[11px]">
          noisy channel
        </text>

        <circle cx="60" cy="150" r="24" className={`${node} stroke-role-alice`} />
        <text
          x="60"
          y="155"
          textAnchor="middle"
          className="fill-role-alice text-[12px] font-medium"
        >
          A
        </text>
        <text x="60" y="194" textAnchor="middle" className="fill-role-alice text-[12px]">
          Alice
        </text>

        <circle cx="340" cy="80" r="24" className={`${node} stroke-role-bob`} />
        <text x="340" y="85" textAnchor="middle" className="fill-role-bob text-[12px] font-medium">
          B
        </text>
        <text x="340" y="124" textAnchor="middle" className="fill-role-bob text-[12px]">
          Bob
        </text>

        <circle cx="340" cy="220" r="24" className={`${node} stroke-role-charlie`} />
        <text
          x="340"
          y="225"
          textAnchor="middle"
          className="fill-role-charlie text-[12px] font-medium"
        >
          C
        </text>
        <text x="340" y="264" textAnchor="middle" className="fill-role-charlie text-[12px]">
          Charlie
        </text>

        <g className="fill-quantum" aria-hidden>
          <circle cx="200" cy="150" r="5" className="hidden motion-reduce:block" />
          {wires.map(({ id, begin }) => (
            <circle key={id} r="5" visibility="hidden" className="motion-reduce:hidden">
              <set attributeName="visibility" to="visible" begin={begin} />
              <animateMotion begin={begin} dur="4s" repeatCount="indefinite" calcMode="paced">
                <mpath href={`#${id}`} />
              </animateMotion>
            </circle>
          ))}
        </g>
      </svg>
    </figure>
  );
}
