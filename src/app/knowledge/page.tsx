"use client";

import { useState } from "react";
import { ArrowRight, BookOpenCheck, FileDown, GraduationCap } from "lucide-react";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { knowledgeCandidates as seed } from "@/lib/mock-data";
import type { KnowledgeCandidate } from "@/lib/types";

const statusTone: Record<KnowledgeCandidate["status"], "amber" | "green" | "slate" | "rose"> = {
  提案中: "amber",
  採用予定: "green",
  保留: "slate",
  却下: "rose",
};

export default function KnowledgePage() {
  const [items, setItems] = useState(seed);
  const setStatus = (id: string, status: KnowledgeCandidate["status"]) =>
    setItems((prev) => prev.map((k) => (k.id === id ? { ...k, status } : k)));

  const adopted = items.filter((k) => k.status === "採用予定").length;

  return (
    <>
      <PageHeader
        eyebrow="暗黙知の資産化"
        title="判断の標準化・仕様への昇格"
        phase="第1〜2フェーズ"
        description="担当者の経験に基づく「仕様書との差分（ぶれ）」を AI が束ね、「これは標準仕様に入れてよいのでは」と提案します。採用したものは翌年度の積算資料・仕様書の改定案として出力できます。"
        actions={
          <Button variant="secondary">
            <FileDown size={14} /> 2027年版 改定案を出力（{adopted}件）
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="rounded-lg bg-sky-50 p-2 text-sky-700">
            <GraduationCap size={18} />
          </span>
          <div>
            <p className="text-xs text-slate-500">担当者の判断（学習済み）</p>
            <p className="text-xl font-bold text-slate-900">
              412<span className="ml-1 text-xs font-normal text-slate-500">件</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
            <BookOpenCheck size={18} />
          </span>
          <div>
            <p className="text-xs text-slate-500">束ねた例外パターン</p>
            <p className="text-xl font-bold text-slate-900">
              {items.length}
              <span className="ml-1 text-xs font-normal text-slate-500">件</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <ArrowRight size={18} />
          </span>
          <div>
            <p className="text-xs text-slate-500">標準仕様へ昇格予定</p>
            <p className="text-xl font-bold text-slate-900">
              {adopted}
              <span className="ml-1 text-xs font-normal text-slate-500">件</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((k) => (
          <Card key={k.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Chip tone={statusTone[k.status]}>{k.status}</Chip>
                  <span className="text-xs text-slate-500">{k.id}</span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">{k.pattern}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  発生 <span className="font-bold text-slate-800">{k.occurrences}件</span> ・ {k.period} ・ 反映先：{k.targetDoc}
                </p>
              </div>
              <div className="flex gap-2">
                {k.status !== "採用予定" && (
                  <Button onClick={() => setStatus(k.id, "採用予定")}>採用する</Button>
                )}
                {k.status !== "保留" && (
                  <Button variant="secondary" onClick={() => setStatus(k.id, "保留")}>
                    保留
                  </Button>
                )}
                {k.status !== "却下" && (
                  <Button variant="ghost" onClick={() => setStatus(k.id, "却下")}>
                    却下
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500">現在の仕様書</p>
                <p className="mt-1 text-sm text-slate-800">{k.currentSpec}</p>
              </div>
              <div className="flex items-center justify-center text-slate-400">
                <ArrowRight size={20} />
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                <p className="text-xs font-bold text-sky-700">実際の判断（担当者の経験値）</p>
                <p className="mt-1 text-sm text-sky-900">{k.observedPractice}</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <p className="text-xs font-bold text-emerald-800">AI の昇格提案</p>
              <p className="mt-1 text-sm text-emerald-900">{k.suggestion}</p>
            </div>

            <details className="mt-3 text-xs text-slate-600">
              <summary className="cursor-pointer font-medium text-slate-700">根拠データ（{k.evidence.length}件）</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {k.evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </details>
          </Card>
        ))}
      </div>
    </>
  );
}
