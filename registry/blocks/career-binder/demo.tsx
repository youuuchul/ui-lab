"use client";
import { CareerBinder, type BinderPage } from "./CareerBinder";

const Bars = ({ values, tone }: { values: number[]; tone: string }) => (
  <div className="flex h-full min-h-28 items-end gap-2 rounded-xl bg-fg/5 p-4">
    {values.map((v, i) => (
      <i key={i} className="flex-1 rounded-t-md" style={{ height: `${v}%`, background: tone, opacity: 0.5 + i * 0.1 }} />
    ))}
  </div>
);

const Detail = ({ title, points }: { title: string; points: [string, string][] }) => (
  <div>
    <h3 className="text-2xl font-extrabold tracking-tight">{title}</h3>
    <ol className="mt-5 grid gap-3">
      {points.map(([k, v]) => (
        <li key={k} className="grid grid-cols-[56px_1fr] gap-3 text-fg/80">
          <span className="font-bold text-accent">{k}</span>
          <span>{v}</span>
        </li>
      ))}
    </ol>
  </div>
);

const pages: BinderPage[] = [
  {
    id: "onboard",
    groupId: "a",
    title: "가입 흐름 단계 줄이기",
    when: "1분기",
    lead: { value: "+12%p", label: "가입 완료율" },
    preview: <Bars values={[40, 52, 61, 70]} tone="#6b8cff" />,
    detail: <Detail title="가입 흐름 단계 줄이기" points={[["문제", "입력 단계가 많아 중간 이탈"], ["해결", "필수 항목만 먼저 받고 나머지는 나중에"], ["결과", "완료율 상승"]]} />,
  },
  {
    id: "report",
    groupId: "a",
    title: "주간 리포트 자동화",
    when: "2분기",
    lead: { value: "-80%", label: "작성 시간" },
    preview: <Bars values={[90, 60, 30, 18]} tone="#5fae9a" />,
    detail: <Detail title="주간 리포트 자동화" points={[["문제", "매주 같은 집계를 손으로"], ["해결", "예약 쿼리와 템플릿"], ["결과", "작성 시간 감소"]]} />,
  },
  {
    id: "search",
    groupId: "b",
    title: "검색 결과 정렬 개선",
    when: "3분기",
    lead: { value: "2.1배", label: "첫 클릭 전환" },
    preview: <Bars values={[30, 45, 58, 80]} tone="#c58b5f" />,
    detail: <Detail title="검색 결과 정렬 개선" points={[["문제", "원하는 결과가 아래에"], ["해결", "클릭 기반 가중치"], ["결과", "첫 클릭 전환 상승"]]} />,
  },
  {
    id: "notify",
    groupId: "c",
    title: "알림 발송 시점 실험",
    when: "4분기",
    lead: { value: "+6%p", label: "재방문율" },
    preview: <Bars values={[50, 55, 62, 66]} tone="#9a7cc4" />,
    detail: <Detail title="알림 발송 시점 실험" points={[["문제", "같은 시간 일괄 발송"], ["해결", "사용 시간대별 발송"], ["결과", "재방문율 상승"]]} />,
  },
];

export default function Demo() {
  return (
    <div className="w-[min(40rem,100%)] px-10">
      <CareerBinder
        groups={[
          { id: "a", name: "팀 A", period: "2024" },
          { id: "b", name: "팀 B", period: "2025" },
          { id: "c", name: "팀 C", period: "2026" },
        ]}
        pages={pages}
      />
    </div>
  );
}
