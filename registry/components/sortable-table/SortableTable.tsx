"use client";
import { useState } from "react";

export type Cell = string | number | null;

export interface SortableColumn {
  key: string;
  label: string;
  /** 숫자 열은 오른쪽 정렬 */
  align?: "left" | "right";
  /** 표시용 변환. null은 항상 "—" */
  format?: (v: number) => string;
  /** 기본 true */
  sortable?: boolean;
}

export interface SortableTableProps {
  /** 표 제목 (스크린리더 caption) */
  caption: string;
  columns: SortableColumn[];
  rows: Record<string, Cell>[];
  /** 행을 구분하는 열 */
  rowKey: string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
}

function compare(a: Cell, b: Cell) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "ko");
}

export function SortableTable({ caption, columns, rows, rowKey, defaultSort }: SortableTableProps) {
  const [sort, setSort] = useState(defaultSort);

  const sorted = sort
    ? [...rows].sort((r1, r2) => {
        const a = r1[sort.key];
        const b = r2[sort.key];
        if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
        return sort.dir === "asc" ? compare(a, b) : compare(b, a);
      })
    : rows;

  const toggle = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm tabular-nums">
        <caption className="sr-only">{caption}. 열 머리 버튼으로 정렬한다.</caption>
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            {columns.map((c) => {
              const right = c.align === "right";
              const on = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={on ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={`px-1 font-medium ${right ? "text-right" : "text-left"}`}
                >
                  {c.sortable === false ? (
                    <span className="inline-flex min-h-10 items-center px-2">{c.label}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      className={`inline-flex min-h-10 items-center gap-1 rounded-md px-2 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-accent ${
                        on ? "text-fg" : ""
                      } ${right ? "flex-row-reverse" : ""}`}
                    >
                      <span aria-hidden="true" className={`w-2.5 text-[10px] ${on ? "" : "invisible"}`}>
                        {sort?.dir === "asc" ? "▲" : "▼"}
                      </span>
                      {c.label}
                    </button>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={String(r[rowKey])} className="border-b border-line last:border-0">
              {columns.map((c, i) => {
                const v = r[c.key];
                const text = v === null ? "—" : typeof v === "number" && c.format ? c.format(v) : typeof v === "number" ? v.toLocaleString("ko-KR") : v;
                const Tag = i === 0 ? "th" : "td";
                return (
                  <Tag
                    key={c.key}
                    scope={i === 0 ? "row" : undefined}
                    className={`px-3 py-2.5 font-normal ${c.align === "right" ? "text-right" : "text-left"} ${v === null ? "text-muted" : i === 0 ? "text-fg" : "text-fg/85"}`}
                  >
                    {text}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
