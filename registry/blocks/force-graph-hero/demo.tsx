"use client";
import { ForceGraphHero } from "./ForceGraphHero";
import type { GraphInput } from "./graph";

const AREAS = [
  { id: "plan", label: "기획", color: "#6b8cff", skills: ["요구사항", "지표 정의", "실험 설계", "화면 흐름"] },
  { id: "data", label: "데이터", color: "#5fae9a", skills: ["SQL", "대시보드", "파이프라인", "통계"] },
  { id: "design", label: "디자인", color: "#c58b5f", skills: ["프로토타입", "디자인 시스템", "모션"] },
  { id: "dev", label: "개발", color: "#9a7cc4", skills: ["React", "API", "배포", "자동화"] },
];
const PROJECTS = [
  { id: "p1", label: "예약 서비스", uses: ["요구사항", "화면 흐름", "React", "API", "배포"] },
  { id: "p2", label: "운영 대시보드", uses: ["지표 정의", "SQL", "대시보드", "파이프라인"] },
  { id: "p3", label: "학습 도구", uses: ["프로토타입", "모션", "React", "실험 설계"] },
  { id: "p4", label: "리포트 봇", uses: ["자동화", "SQL", "통계", "API"] },
];

const data: GraphInput = {
  nodes: [
    ...AREAS.map((a) => ({ id: a.id, label: a.label, color: a.color, big: true })),
    ...AREAS.flatMap((a) => a.skills.map((s) => ({ id: s, label: s, color: a.color }))),
    ...PROJECTS.map((p) => ({ id: p.id, label: p.label, color: "#e8e3d8", big: true })),
  ],
  links: [
    ...AREAS.flatMap((a) => a.skills.map((s) => ({ source: a.id, target: s }))),
    ...PROJECTS.flatMap((p) => p.uses.map((u) => ({ source: p.id, target: u }))),
  ],
  order: PROJECTS.flatMap((p) => [p.id, ...p.uses]),
};

export default function Demo() {
  return (
    <ForceGraphHero data={data} className="h-72 w-[min(36rem,100%)] rounded-xl">
      <div className="p-5">
        <p className="font-mono text-xs text-accent">PORTFOLIO</p>
        <p className="mt-1 text-xl font-bold tracking-tight text-fg">프로젝트와 역량의 연결</p>
      </div>
    </ForceGraphHero>
  );
}
