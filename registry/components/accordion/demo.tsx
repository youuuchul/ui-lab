"use client";
import { Accordion } from "./Accordion";

export default function Demo() {
  return (
    <div className="w-[22rem] rounded-card border border-line bg-bg px-4">
      <Accordion
        defaultValue={["refund"]}
        items={[
          { value: "refund", title: "환불은 언제 되나요?", content: "취소 요청 후 영업일 기준 3일 안에 결제 수단으로 돌려드려요." },
          { value: "change", title: "예약 시간을 바꿀 수 있나요?", content: "이용 하루 전까지는 예약 내역에서 직접 바꿀 수 있어요." },
          { value: "receipt", title: "영수증은 어디서 받나요?", content: "결제 완료 메일과 예약 상세 화면에서 내려받을 수 있어요." },
        ]}
      />
    </div>
  );
}
