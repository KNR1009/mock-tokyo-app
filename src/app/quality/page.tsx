"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, RefreshCw, ScanLine } from "lucide-react";
import { Button, Card, Chip, PageHeader, SeverityBadge } from "@/components/ui";
import { qualityIssues as seed } from "@/lib/mock-data";
import type { IssueType, QualityIssue } from "@/lib/types";

const typeTone: Record<IssueType, "rose" | "amber" | "navy" | "slate"> = {
  抜け漏れ: "rose",
  外れ値: "amber",
  不整合: "navy",
  改定漏れ: "slate",
};

export default function QualityPage() {
  const [issues, setIssues] = useState<QualityIssue[]>(seed);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<"open" | "resolved">("open");

  const toggle = (id: string) => setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i)));
  const list = issues.filter((i) => (tab === "open" ? !i.resolved : i.resolved));
  const counts = (["抜け漏れ", "外れ値", "不整合", "改定漏れ"] as IssueType[]).map((t) => ({
    t,
    n: issues.filter((i) => i.type === t && !i.resolved).length,
  }));

  const rescan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1500);
  };

  return (
    <>
      <PageHeader
        eyebrow="資料の品質担保"
        title="積算資料 品質チェック"
        phase="第1フェーズ"
        description="積算資料・参考資料（仕様書）を AI が横断的に読み、数値の抜け漏れ・外れ値・ページ間の不整合・改定漏れを具体的な根拠つきで指摘します。「この数字があった方がよい」で終わらず、修正案まで提示します。"
        actions={
          <Button onClick={rescan} disabled={scanning}>
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} /> {scanning ? "チェック中…" : "再チェック"}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {counts.map(({ t, n }) => (
          <div key={t} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Chip tone={typeTone[t]}>{t}</Chip>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {n}
              <span className="ml-1 text-sm font-normal text-slate-500">件</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 mb-3 flex items-center gap-4 text-sm">
        <div className="flex gap-1 rounded-lg bg-slate-200/60 p-1">
          {(["open", "resolved"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === k ? "bg-white shadow-sm" : "text-slate-600"}`}
            >
              {k === "open" ? "未解決" : "解決済み"}{" "}
              <span className="text-slate-400">{issues.filter((i) => (k === "open" ? !i.resolved : i.resolved)).length}</span>
            </button>
          ))}
        </div>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <ScanLine size={12} /> 対象：積算資料 2026年版（48p）／ 参考資料（仕様書）（32p）・最終チェック 2026-09-12 08:00
        </p>
      </div>

      <div className="space-y-3">
        {list.map((i) => (
          <Card key={i.id} className={i.resolved ? "opacity-70" : ""}>
            <div className="flex flex-wrap items-start gap-4">
              <button
                onClick={() => toggle(i.id)}
                className="mt-0.5 text-slate-400 hover:text-emerald-600"
                title={i.resolved ? "未解決に戻す" : "解決済みにする"}
              >
                {i.resolved ? <CheckCircle2 size={22} className="text-emerald-600" /> : <CircleDashed size={22} />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone={typeTone[i.type]}>{i.type}</Chip>
                  <SeverityBadge severity={i.severity} />
                  <span className="text-xs text-slate-500">
                    {i.doc} ・ {i.location}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">{i.description}</p>
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-600">AI の修正案</p>
                  <p className="mt-1 text-sm text-slate-800">{i.suggestion}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button variant="secondary">該当ページを開く</Button>
                {!i.resolved && (
                  <Button variant="ghost" onClick={() => toggle(i.id)}>
                    修正済みにする
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <Card>
            <p className="py-6 text-center text-sm text-slate-500">該当する指摘はありません。</p>
          </Card>
        )}
      </div>
    </>
  );
}
