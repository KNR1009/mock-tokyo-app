"use client";

import { useState } from "react";
import { FileUp, Loader2, ScanSearch, Sparkles } from "lucide-react";
import { Button, Card, Chip, Confidence, FitBadge, PageHeader } from "@/components/ui";
import { yen } from "@/lib/format";

const extracted = [
  { k: "管径", v: "φ250", conf: 98 },
  { k: "推進延長", v: "62.0 m（No.3 → No.4）", conf: 96 },
  { k: "土質（柱状図）", v: "砂質土 → 礫混じり砂（GL-4.0m 以深）", conf: 88 },
  { k: "N値", v: "12 → 25", conf: 90 },
  { k: "地下水位", v: "GL-2.6 m", conf: 93 },
  { k: "発進立坑", v: "φ2.5 m（ライナープレート）", conf: 85 },
  { k: "到達立坑", v: "φ2.0 m", conf: 82 },
  { k: "管底高（発進）", v: "TP+3.21 m", conf: 71 },
];

export default function DrawingsPage() {
  const [stage, setStage] = useState<"idle" | "reading" | "done">("idle");

  const run = () => {
    setStage("reading");
    setTimeout(() => setStage("done"), 1800);
  };

  return (
    <>
      <PageHeader
        eyebrow="マルチモーダル"
        title="図面直読"
        phase="第2フェーズ（プレビュー）"
        description="設計図面（PDF・スキャン・手書き）と地盤データを見せるだけで、資料を見せずに「これがいけます」という機種提案まで到達することを目指します。読み取り値には信頼度を付与し、低いものは担当者の確認を促します。"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="図面・地盤データのアップロード">
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition ${
              stage === "idle" ? "border-slate-300 bg-slate-50" : "border-navy-300 bg-navy-50/40"
            }`}
          >
            {stage === "reading" ? (
              <Loader2 size={36} className="animate-spin text-navy-600" />
            ) : (
              <FileUp size={36} className="text-slate-400" />
            )}
            <p className="mt-3 text-sm font-medium text-slate-800">
              {stage === "idle" && "平面図・縦断図・柱状図をドロップ"}
              {stage === "reading" && "図面を読み取っています…"}
              {stage === "done" && "読み取り完了：sample_plan_no3-no4.pdf"}
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF / JPG / PNG / DXF（最大 50MB）</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={run} disabled={stage === "reading"}>
                <ScanSearch size={14} /> サンプル図面で試す
              </Button>
              {stage === "done" && (
                <Button variant="ghost" onClick={() => setStage("idle")}>
                  クリア
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-bold text-slate-700">読み取り対象</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>平面図：管径・延長・立坑位置・人孔番号</li>
              <li>縦断図：管底高・勾配・土被り</li>
              <li>柱状図（地質調査）：土質区分・N値・地下水位・礫径</li>
              <li>手書き図面：判読できない箇所は信頼度を下げて担当者へ確認依頼</li>
            </ul>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="読み取り結果">
            {stage !== "done" ? (
              <p className="py-10 text-center text-sm text-slate-500">図面をアップロードすると、抽出した条件がここに表示されます。</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {extracted.map((e) => (
                  <li key={e.k} className="flex items-center justify-between gap-4 py-2 text-sm">
                    <span className="w-28 shrink-0 text-slate-500">{e.k}</span>
                    <span className={`flex-1 font-medium ${e.conf < 80 ? "text-amber-700" : "text-slate-800"}`}>{e.v}</span>
                    <Confidence value={e.conf} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {stage === "done" && (
            <Card
              title={
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-navy-600" /> 機種提案（資料を見せずに到達）
                </span>
              }
            >
              <div className="flex items-center gap-4">
                <FitBadge fit="○" size="lg" />
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900">BM-R型 礫対応削進機</p>
                  <p className="text-xs text-slate-500">GL-4.0m 以深の礫混じり砂を考慮し、BM-M型ではなく BM-R型 を選定</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">概算</p>
                  <p className="font-bold tabular-nums">{yen(6_380_000)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip tone="amber">管底高の信頼度 71% → 要確認</Chip>
                <Chip tone="amber">延長 62m → 中間ジャッキ要否を確認</Chip>
              </div>
              <div className="mt-4 flex gap-2">
                <Button>積算判定アシストへ送る</Button>
                <Button variant="secondary">読み取り値を修正</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
