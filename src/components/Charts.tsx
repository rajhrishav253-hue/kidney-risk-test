// Lightweight inline SVG charts — no external chart library.

export function LineChart({
  data,
  height = 180,
  color = '#22d3ee',
  yMin,
  yMax,
  yLabel,
}: {
  data: { label: string; value: number | null }[];
  height?: number;
  color?: string;
  yMin?: number;
  yMax?: number;
  yLabel?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="grid h-40 place-items-center text-sm text-slate-500">
        No data yet
      </div>
    );
  }

  const values = data.map((d) => d.value).filter((v): v is number => v != null);
  if (values.length === 0) {
    return (
      <div className="grid h-40 place-items-center text-sm text-slate-500">
        No data yet
      </div>
    );
  }

  const width = 600;
  const pad = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const min = yMin ?? Math.min(...values);
  const max = yMax ?? Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = pad.left + (i / Math.max(1, data.length - 1)) * innerW;
    const y =
      d.value == null
        ? null
        : pad.top + innerH - ((d.value - min) / range) * innerH;
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points
    .filter((p) => p.y != null)
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ');

  const areaPath =
    points.filter((p) => p.y != null).length > 0
      ? `${linePath} L${pad.left + innerW},${pad.top + innerH} L${pad.left},${pad.top + innerH} Z`
      : '';

  const ticks = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = pad.top + (i / ticks) * innerH;
        const val = max - (i / ticks) * range;
        return (
          <g key={i}>
            <line
              x1={pad.left}
              y1={y}
              x2={width - pad.right}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
              {val.toFixed(2)}
            </text>
          </g>
        );
      })}
      {areaPath && <path d={areaPath} fill="url(#lc-fill)" />}
      {linePath && (
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      )}
      {points.map((p, i) =>
        p.y == null ? null : (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={color} />
            <circle cx={p.x} cy={p.y} r="6" fill={color} opacity="0.2" />
          </g>
        )
      )}
      {points.map((p, i) => (
        <text
          key={`l-${i}`}
          x={p.x}
          y={height - 10}
          textAnchor="middle"
          fontSize="8.5"
          fill="#64748b"
        >
          {p.label}
        </text>
      ))}
      {yLabel && (
        <text
          x={10}
          y={pad.top + innerH / 2}
          textAnchor="middle"
          fontSize="9"
          fill="#64748b"
          transform={`rotate(-90, 10, ${pad.top + innerH / 2})`}
        >
          {yLabel}
        </text>
      )}
    </svg>
  );
}

export function BarChart({
  data,
  height = 180,
  color = '#3b82f6',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="grid h-40 place-items-center text-sm text-slate-500">
        No data yet
      </div>
    );
  }

  const width = 600;
  const pad = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = innerW / data.length - 8;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const x = pad.left + (i / data.length) * innerW + 4;
        const h = (d.value / max) * innerH;
        const y = pad.top + innerH - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx="4"
              fill="url(#bar-fill)"
            />
            <text
              x={x + barW / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="8.5"
              fill="#64748b"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Gauge({
  value,
  size = 160,
}: {
  value: number; // 0..1
  size?: number;
}) {
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const offset = circ * (1 - pct * 0.75);
  const color = pct < 0.4 ? '#22c55e' : pct < 0.7 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ}`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circ * 0.75 * pct} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-[Space_Grotesk] text-3xl font-bold text-white">
          {Math.round(pct * 100)}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">risk score</span>
      </div>
    </div>
  );
}
