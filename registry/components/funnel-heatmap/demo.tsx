import { FunnelHeatmap } from "./FunnelHeatmap";

export default function Demo() {
  return (
    <div className="w-full max-w-[640px] rounded-2xl border border-line bg-surface p-4">
      <FunnelHeatmap
        title="세그먼트별 퍼널 · 7일"
        steps={["행사 상세", "로그인·가입", "신청 화면", "결제"]}
        rows={[
          { label: "전체", base: 20082, rates: [0.925, 0.301, 0.147, 0.073] },
          { group: "채널", label: "유료", base: 4402, rates: [0.963, 0.21, 0.091, 0.045] },
          { group: "채널", label: "비유료", base: 15680, rates: [0.914, 0.326, 0.163, 0.081] },
          { group: "플랫폼", label: "iOS", base: 15287, rates: [0.926, 0.298, 0.145, 0.072] },
          { group: "플랫폼", label: "Android", base: 3452, rates: [0.919, 0.313, 0.157, 0.08] },
          { group: "플랫폼", label: "웹", base: 1343, rates: [0.931, 0.296, 0.142, 0.071] },
          { group: "회원", label: "회원", base: 5924, rates: [0.952, 0.952, 0.486, 0.243] },
          { group: "회원", label: "비회원", base: 14158, rates: [0.914, 0.028, 0.006, 0.002] },
        ]}
      />
    </div>
  );
}
