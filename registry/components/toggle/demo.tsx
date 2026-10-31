"use client";
import { useState } from "react";
import { Toggle } from "./Toggle";

type Child = "comments" | "night";

/**
 * 하위 값은 따로 기억하고 화면에는 `푸시 && 하위`로 보인다.
 * 푸시를 다시 켜면 기억한 선택이 돌아온다. 푸시가 꺼진 채 하위를 켜면 그 항목만 켜고 푸시를 켠다.
 */
export default function Demo() {
  const [push, setPush] = useState(true);
  const [prefs, setPrefs] = useState<Record<Child, boolean>>({ comments: true, night: false });
  const child = (key: Child) => ({
    checked: push && prefs[key],
    onChange: (v: boolean) => {
      if (v && !push) {
        setPrefs({ comments: false, night: false, [key]: true });
        setPush(true);
      } else setPrefs((p) => ({ ...p, [key]: v }));
    },
  });

  return (
    <div className="w-80 rounded-card border border-line bg-bg px-4">
      <Toggle className="py-3.5" label="푸시 알림" description={push ? "아래에서 고른 알림을 받아요" : "푸시 알림을 받지 않아요"} checked={push} onChange={setPush} />
      <div className="ml-3 border-l border-line pl-4">
        <Toggle className="py-3" label="댓글·답글" {...child("comments")} />
        <Toggle className="py-3" label="야간 알림" description="밤 10시~오전 8시에도 받기" {...child("night")} />
      </div>
      <div className="border-t border-line">
        <Toggle className="py-3.5" label="이메일 소식" description="한 달에 한 번" />
      </div>
    </div>
  );
}
