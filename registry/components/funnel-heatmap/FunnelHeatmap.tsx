export interface FunnelRow {
  /** 세그먼트 축 이름 (예: "채널"). 같은 축의 첫 행에만 보인다 */
  group?: string;
  label: string;
  /** 첫 단계 사람 수 */
  base: number;
  /** 첫 단계 대비 도달률 0~1, steps와 같은 길이 */
  rates: number[];
}

export interface FunnelHeatmapProps {
  /** 표 제목 (스크린리더 caption) */
  title: string;
  /** 첫 단계 열 이름 */
  baseLabel?: string;
  /** 첫 단계 뒤 단계 이름 */
  steps: string[];
  rows: FunnelRow[];
}

export function FunnelHeatmap({ title, baseLabel = "랜딩", steps, rows }: FunnelHeatmapProps) {
  const range = steps.map((_, k) => {
    const col = rows.map((r) => r.rates[k]);
    return { min: Math.min(...col), max: Math.max(...col) };
  });
  const grouped = rows.some((r) => r.group);
  const shade = (v: number, k: number) => {
    const { min, max } = range[k];
    const t = max > min ? (v - min) / (max - min) : 0.5;
    return 0.1 + t * 0.6;
  };

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[30rem] border-separate border-spacing-1 text-sm tabular-nums">
        <caption className="sr-only">{title}. 칸 숫자는 첫 단계 대비 도달률, 진할수록 열 안에서 높다.</caption>
        <thead>
          <tr className="text-xs text-muted">
            <td />
            <th scope="col" className="px-2 py-1.5 text-right font-medium">
              {baseLabel}
            </th>
            {steps.map((s) => (
              <th key={s} scope="col" className="px-2 py-1.5 text-center font-medium">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const first = !!r.group && rows[i - 1]?.group !== r.group;
            return (
              <tr key={`${r.group ?? ""}-${r.label}`}>
                <th scope="row" className="px-2 py-1.5 text-left font-normal whitespace-nowrap">
                  {grouped && <span className={`mr-2 inline-block w-10 text-xs text-muted ${first ? "" : "invisible"}`}>{r.group}</span>}
                  <span className="text-fg">{r.label}</span>
                </th>
                <td className="px-2 py-1.5 text-right text-fg/80">{r.base.toLocaleString("ko-KR")}</td>
                {r.rates.map((v, k) => (
                  <td
                    key={k}
                    className="rounded-md px-2 py-1.5 text-center text-fg"
                    style={{ backgroundColor: `color-mix(in srgb, var(--color-accent) ${Math.round(shade(v, k) * 100)}%, transparent)` }}
                  >
                    {(v * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
