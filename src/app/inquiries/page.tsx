"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, Confidence, FitBadge, PageHeader, StatusBadge } from "@/components/ui";
import { useInquiries } from "@/lib/inquiry-store";
import { dateTime, yen } from "@/lib/format";
import type { InquiryStatus } from "@/lib/types";

const filters: { key: InquiryStatus | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "pending_review", label: "確認待ち" },
  { key: "approved", label: "承認済み" },
  { key: "revised", label: "修正して回答" },
  { key: "escalated", label: "相談中" },
];

export default function InquiriesPage() {
  const { inquiries } = useInquiries();
  const [filter, setFilter] = useState<InquiryStatus | "all">("all");
  const [query, setQuery] = useState("");

  const list = inquiries.filter(
    (q) =>
      (filter === "all" || q.status === filter) &&
      (query === "" || `${q.title} ${q.client} ${q.id}`.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        eyebrow="AIの弟子入り"
        title="積算判定アシスト"
        phase="第1フェーズ"
        description="届いた図面・条件に対して、AIが積算資料・仕様書・過去の判断履歴を照らし合わせて回答案を作成します。担当者は確認・修正・相談のいずれかで処理してください。"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-200/60 p-1">
          {filters.map((f) => {
            const n = f.key === "all" ? inquiries.length : inquiries.filter((q) => q.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f.label} <span className="ml-1 text-slate-400">{n}</span>
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm">
          <Search size={14} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="案件名・依頼元・受付番号"
            className="w-56 bg-transparent outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <Card className="overflow-hidden !p-0">
        <div className="-m-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">受付</th>
                <th className="px-4 py-2.5 text-left font-medium">案件</th>
                <th className="px-4 py-2.5 text-left font-medium">条件</th>
                <th className="px-4 py-2.5 text-left font-medium">AI 提案機種</th>
                <th className="px-4 py-2.5 text-left font-medium">適合</th>
                <th className="px-4 py-2.5 text-left font-medium">信頼度</th>
                <th className="px-4 py-2.5 text-right font-medium">概算</th>
                <th className="px-4 py-2.5 text-left font-medium">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 align-top text-xs text-slate-500">
                    <p>{dateTime(q.receivedAt)}</p>
                    <p className="mt-0.5">{q.source}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link href={`/inquiries/${q.id}`} className="font-medium text-navy-700 hover:underline">
                      {q.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {q.client} ・ {q.id}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-600">
                    φ{q.pipeDiameter} ／ {q.length}m
                    <br />
                    {q.soil}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-800">{q.proposal.machine}</td>
                  <td className="px-4 py-3 align-top">
                    <FitBadge fit={q.proposal.fit} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Confidence value={q.proposal.confidence} />
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums">{yen(q.proposal.estimate)}</td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={q.status} />
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    該当する案件がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
