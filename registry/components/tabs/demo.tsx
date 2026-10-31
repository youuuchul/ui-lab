"use client";
import { Tabs } from "./Tabs";

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between py-1.5 text-sm">
    <span className="text-muted">{k}</span>
    <span>{v}</span>
  </div>
);

export default function Demo() {
  return (
    <div className="w-80 rounded-card border border-line bg-bg px-4 pb-4">
      <Tabs
        label="상품 정보"
        fitted
        defaultValue="info"
        items={[
          {
            value: "info",
            label: "상세 정보",
            content: (
              <div>
                <Row k="소재" v="면 100%" />
                <Row k="사이즈" v="S · M · L" />
                <Row k="배송" v="2~3일 이내 출고" />
              </div>
            ),
          },
          {
            value: "review",
            label: "리뷰 12",
            content: <p className="text-sm leading-relaxed text-fg/80">두께가 적당해서 봄가을에 입기 좋아요. 한 치수 크게 나온 편이에요.</p>,
          },
          { value: "qna", label: "문의", content: <p className="text-sm text-muted">아직 문의가 없어요</p> },
          { value: "event", label: "이벤트", content: null, disabled: true },
        ]}
      />
    </div>
  );
}
