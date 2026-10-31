"use client";
import { Quote } from "./Quote";

export default function Demo() {
  return (
    <div className="max-h-72 w-[min(36rem,100%)] overflow-auto rounded-xl bg-bg p-6">
      <Quote
        kicker="스튜디오 · 업무 안내"
        title="업무별 범위·기간"
        sub="범위를 확인한 뒤 일정을 확정합니다."
        groups={[
          {
            name: "화면",
            offers: [
              { title: "랜딩 페이지", what: "한 페이지 소개 사이트 기획·디자인·구현", output: "배포된 사이트, 소스", value: "2주" },
              { title: "대시보드", what: "지표 정의부터 화면 구성까지", output: "대시보드, 지표 정의서", value: "3주" },
            ],
          },
          {
            name: "자동화",
            offers: [{ title: "리포트 자동화", what: "반복 보고서를 예약 실행으로", output: "스크립트, 운영 문서", value: "1주" }],
          },
        ]}
        notes={["기간은 자료를 받은 날부터 셉니다."]}
        steps={[
          { k: "문의", v: "목표와 일정 공유" },
          { k: "범위", v: "업무 범위 확정" },
          { k: "진행", v: "주 단위 공유" },
          { k: "인계", v: "결과물·문서 전달" },
        ]}
        footer={
          <a
            href="#quote-contact"
            onClick={(e) => e.preventDefault()}
            className="rounded-full bg-fg px-5 py-3 text-bg transition-[transform,opacity] hover:opacity-85 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            문의하기 →
          </a>
        }
      />
    </div>
  );
}
