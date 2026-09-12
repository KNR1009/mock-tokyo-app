"use client";

import { useState } from "react";
import { Clapperboard, FileDown, Loader2, Play, Upload } from "lucide-react";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { manualJobs } from "@/lib/mock-data";

const statusTone = { 生成済み: "green", 生成中: "amber", 未着手: "slate" } as const;

export default function ManualsPage() {
  const [selected, setSelected] = useState(manualJobs[0]);

  return (
    <>
      <PageHeader
        eyebrow="現場の技能承継"
        title="動画→作業マニュアル自動生成"
        phase="第0フェーズ（先行）"
        description="作業動画をアップロードすると、AI が手順を切り出して作業手順書を自動生成します。作業員の引継ぎ・新人教育に使用でき、現場要員の入れ替わりで浅くなった経験を補います。撮影はスマートフォンで可。"
        actions={
          <Button>
            <Upload size={14} /> 動画をアップロード
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="生成ジョブ" className="lg:col-span-1">
          <ul className="space-y-2">
            {manualJobs.map((j) => (
              <li key={j.id}>
                <button
                  onClick={() => setSelected(j)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selected.id === j.id ? "border-navy-300 bg-navy-50/50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{j.title}</p>
                    <Chip tone={statusTone[j.status]}>{j.status}</Chip>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {j.videoLength} ・ {j.uploadedAt}
                  </p>
                  {j.status === "生成中" && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full bg-amber-500" style={{ width: `${j.progress}%` }} />
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          className="lg:col-span-2"
          title={selected.title}
          action={
            selected.status === "生成済み" && (
              <div className="flex gap-2">
                <Button variant="secondary">
                  <FileDown size={14} /> PDF
                </Button>
                <Button variant="secondary">
                  <FileDown size={14} /> Word
                </Button>
              </div>
            )
          }
        >
          <div className="mb-5 flex aspect-video items-center justify-center rounded-lg bg-slate-900 text-slate-400">
            <div className="text-center">
              <Clapperboard size={40} className="mx-auto" />
              <p className="mt-2 text-xs">動画プレビュー（{selected.videoLength}）</p>
            </div>
          </div>

          {selected.status === "生成済み" && selected.steps && (
            <ol className="space-y-3">
              {selected.steps.map((s) => (
                <li key={s.no} className="flex gap-4 rounded-lg border border-slate-200 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-white">
                    {s.no}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{s.title}</p>
                      <button className="flex items-center gap-1 text-xs text-navy-700 hover:underline">
                        <Play size={12} /> {s.timestamp}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {selected.status === "生成中" && (
            <div className="flex flex-col items-center py-10 text-slate-500">
              <Loader2 size={28} className="animate-spin text-amber-500" />
              <p className="mt-3 text-sm">手順を切り出しています… {selected.progress}%</p>
              <p className="mt-1 text-xs">音声の文字起こし → 場面分割 → 手順文の生成</p>
            </div>
          )}
          {selected.status === "未着手" && (
            <div className="flex flex-col items-center py-10 text-slate-500">
              <p className="text-sm">アップロード済み。生成を開始してください。</p>
              <Button className="mt-3">生成を開始</Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
