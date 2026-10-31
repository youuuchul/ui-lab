import { Badge, type BadgeTone } from "./Badge";

const ORDERS: { name: string; date: string; status: string; tone: BadgeTone }[] = [
  { name: "린넨 셔츠", date: "10.29", status: "배송 중", tone: "accent" },
  { name: "코튼 팬츠", date: "10.27", status: "배송 완료", tone: "success" },
  { name: "울 니트", date: "10.26", status: "입금 대기", tone: "warning" },
  { name: "캔버스 백", date: "10.20", status: "취소", tone: "danger" },
];

export default function Demo() {
  return (
    <div className="w-80 rounded-card border border-line bg-bg px-4 py-2">
      {ORDERS.map((o, i) => (
        <div key={o.name} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{o.name}</span>
            {i === 0 && (
              <Badge size="sm" appearance="solid" tone="accent">
                NEW
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted">{o.date}</span>
            <Badge tone={o.tone} dot>
              {o.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
