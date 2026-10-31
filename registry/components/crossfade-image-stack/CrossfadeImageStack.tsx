"use client";

export interface CrossfadeImageStackProps {
  /** 키 → 이미지 URL. 모든 이미지를 동시에 마운트한다 */
  images: Record<string, string>;
  /** 보여줄 키. 없는 키면 fallbackKey로 */
  activeKey: string;
  fallbackKey?: string;
  alt: string;
  className?: string;
}

export function CrossfadeImageStack({ images, activeKey, fallbackKey, alt, className = "" }: CrossfadeImageStackProps) {
  const shownKey = activeKey in images ? activeKey : fallbackKey;
  const shownUrl = shownKey ? images[shownKey] : undefined;
  const urls = [...new Set(Object.values(images).filter(Boolean))];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {urls.map((url) => (
        <img
          key={url}
          src={url}
          alt={url === shownUrl ? alt : ""}
          aria-hidden={url !== shownUrl}
          decoding="async"
          loading="eager"
          className={`absolute inset-0 h-full w-full object-cover object-top outline outline-1 -outline-offset-1 outline-white/10 transition-opacity duration-300 motion-reduce:transition-none ${
            url === shownUrl ? "opacity-100" : "opacity-0"
          }`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ))}
    </div>
  );
}
