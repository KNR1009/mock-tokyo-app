"use client";

import { useState } from "react";
import { AlertTriangle, Ban, CheckCircle2, Database, FileUp, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { knowledgeSources as seed, sourceCategoryDesc } from "@/lib/mock-data";
import type { KnowledgeSource, SourceCategory, SourceStatus } from "@/lib/types";

const statusTone: Record<SourceStatus, "green" | "amber" | "rose" | "slate"> = {
  取込済み: "green",
  取込中: "amber",
  要確認: "rose",
  除外: "slate",
};

const categories = Object.keys(sourceCategoryDesc) as SourceCategory[];

export default function SourcesPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>(seed);
  const [filter, setFilter] = useState<SourceCategory | "all">("all");
  const [reindexing, setReindexing] = useState(false);

  const toggleExclude = (id: string) =>
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "除外" ? "取込済み" : "除外" } : s)),
    );
  const markChecked = (id: string) => setSources((prev) => prev.map((s) => (s.id === id ? { ...s, status: "取込済み" } : s)));

  const list = sources.filter((s) => filter === "all" || s.category === filter);
  const active = sources.filter((s) => s.status === "取込済み").length;
  const needsCheck = sources.filter((s) => s.status === "要確認").length;

  const reindex = () => {
    setReindexing(true);
    setTimeout(() => {
      setSources((prev) => prev.map((s) => (s.status === "取込中" ? { ...s, status: "取込済み" } : s)));
      setReindexing(false);
    }, 1800);
  };

  return (
    <>
      <PageHeader
        eyebrow="データの持たせ方が最大の肝"
        title="参照データ管理"
        phase="第1フェーズ"
        description="AI が回答案を作るときに照らし合わせる「積算資料・仕様書・過去の判断履歴」を登録・管理します。仕様変更前の古いデータは混ぜると誤った出力になるため、有効期間で区切って除外できます。ナレッジは特定の AI ツールに閉じず、自社の資産として保持されます。"
        actions={
          <>
            <Button variant="secondary" onClick={reindex} disabled={reindexing}>
              <RefreshCw size={14} className={reindexing ? "animate-spin" : ""} /> {reindexing ? "再取込中…" : "AI に再取込"}
            </Button>
            <Button>
              <FileUp size={14} /> ファイルを追加
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">AI が参照中</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {active}
            <span className="ml-1 text-sm font-normal text-slate-500">ファイル</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">要確認</p>
          <p className={`mt-1 text-2xl font-bold ${needsCheck > 0 ? "text-rose-700" : "text-slate-900"}`}>
            {needsCheck}
            <span className="ml-1 text-sm font-normal text-slate-500">ファイル</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">判断履歴（学習対象）</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            412<span className="ml-1 text-sm font-normal text-slate-500">件</span>
          </p>
          <p className="text-[11px] text-slate-500">2023-04-01 以降（仕様変更後）</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">最終取込</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">09-12</p>
          <p className="text-[11px] text-slate-500">2026-09-12 08:00 自動</p>
        </div>
      </div>

      <div className="mt-6 mb-3 flex flex-wrap gap-1 rounded-lg bg-slate-200/60 p-1 self-start">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === "all" ? "bg-white shadow-sm" : "text-slate-600"}`}
        >
          すべて <span className="text-slate-400">{sources.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === c ? "bg-white shadow-sm" : "text-slate-600"}`}
          >
            {c} <span className="text-slate-400">{sources.filter((s) => s.category === c).length}</span>
          </button>
        ))}
      </div>

      {filter !== "all" && (
        <p className="mb-3 flex items-center gap-2 text-xs text-slate-600">
          <Database size={12} /> {sourceCategoryDesc[filter]}
        </p>
      )}

      <div className="space-y-3">
        {list.map((s) => (
          <Card key={s.id} className={s.status === "除外" ? "opacity-60" : ""}>
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="navy">{s.category}</Chip>
                  <Chip tone={statusTone[s.status]}>
                    {s.status === "取込中" && <Loader2 size={10} className="mr-1 inline animate-spin" />}
                    {s.status}
                  </Chip>
                  <span className="text-xs text-slate-500">
                    {s.fileType} ・ {s.size} ・ {s.volume}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-900">{s.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {s.version && <>版：{s.version} ・ </>}
                  有効期間：{s.validFrom ?? "—"} 〜 {s.validTo ?? "現在"} ・ 更新 {s.updatedAt}
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="text-xs font-bold text-slate-500">用途：</span>
                  {s.usedFor}
                </p>
                {s.note && (
                  <p
                    className={`mt-2 flex items-start gap-1.5 rounded-md p-2 text-xs ${
                      s.status === "要確認" ? "bg-rose-50 text-rose-800" : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {s.status === "要確認" ? <AlertTriangle size={14} className="mt-0.5 shrink-0" /> : <ShieldCheck size={14} className="mt-0.5 shrink-0" />}
                    {s.note}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {s.status === "要確認" && (
                  <Button onClick={() => markChecked(s.id)}>
                    <CheckCircle2 size={14} /> 確認済みにする
                  </Button>
                )}
                <Button variant="secondary">内容を見る</Button>
                <Button variant={s.status === "除外" ? "secondary" : "ghost"} onClick={() => toggleExclude(s.id)}>
                  <Ban size={14} /> {s.status === "除外" ? "参照対象に戻す" : "参照対象から除外"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6" title="データ登録のルール（現地訪問時に確認する事項）">
        <ul className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
          <li className="rounded-lg bg-slate-50 p-3">
            <p className="font-bold text-slate-900">1. 有効期間で区切る</p>
            仕様変更（2023-04）をまたぐデータは混ぜない。年度版の積算資料は有効期間を設定し、案件の受付日で自動的に切り替える。
          </li>
          <li className="rounded-lg bg-slate-50 p-3">
            <p className="font-bold text-slate-900">2. 判断履歴は「理由」つきで</p>
            機種・金額だけでなく、担当者がなぜそう判断したか（コメント列）が学習の核になる。紙・手書きの履歴はスキャン後に Excel 化する。
          </li>
          <li className="rounded-lg bg-slate-50 p-3">
            <p className="font-bold text-slate-900">3. 矛盾は品質チェックへ</p>
            資料間で数値が食い違う場合は「要確認」となり、資料 品質チェックの指摘と連動する。どちらを正とするか担当者が決める。
          </li>
          <li className="rounded-lg bg-slate-50 p-3">
            <p className="font-bold text-slate-900">4. AI ツールに閉じない</p>
            ここに登録したデータは自社ストレージ・DB に保持され、接続先モデル（Claude／GPT／ローカル）を切り替えても失われない。
          </li>
        </ul>
      </Card>
    </>
  );
}
