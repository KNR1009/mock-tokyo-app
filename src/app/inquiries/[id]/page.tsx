"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  MessageSquareWarning,
  PencilLine,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button, Card, Chip, Confidence, FitBadge, KeyValue, PageHeader, StatusBadge } from "@/components/ui";
import { useInquiries } from "@/lib/inquiry-store";
import { dateTime, yen } from "@/lib/format";

type Mode = "approve" | "revise" | "escalate" | null;

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { inquiries, approve, revise, escalate, reopen } = useInquiries();
  const q = inquiries.find((i) => i.id === id);
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState("");
  const [delta, setDelta] = useState("");

  if (!q) {
    return (
      <div className="py-20 text-center text-slate-500">
        案件が見つかりません。
        <Link href="/inquiries" className="ml-2 text-navy-700 underline">
          一覧へ戻る
        </Link>
      </div>
    );
  }

  const p = q.proposal;
  const isPending = q.status === "pending_review";

  const submit = () => {
    if (mode === "approve") approve(q.id, { note });
    if (mode === "revise") revise(q.id, { note, learnedDelta: delta });
    if (mode === "escalate") escalate(q.id, { note });
    setMode(null);
    setNote("");
    setDelta("");
  };

  return (
    <>
      <Link href="/inquiries" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> 一覧へ戻る
      </Link>
      <PageHeader
        eyebrow={`${q.id} ・ ${dateTime(q.receivedAt)} 受付 ・ ${q.source}`}
        title={q.title}
        actions={<StatusBadge status={q.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 左：入力条件 */}
        <div className="space-y-6">
          <Card title="図面・現場条件（入力）">
            <KeyValue
              items={[
                { k: "依頼元", v: q.client },
                { k: "区分", v: q.clientType },
                { k: "工種", v: q.workType },
                { k: "管径", v: `φ${q.pipeDiameter} mm` },
                { k: "推進延長", v: `${q.length} m` },
                { k: "土質", v: q.soil },
                { k: "N値", v: q.nValue },
                { k: "地下水位", v: q.groundwater },
                { k: "立坑", v: q.shaft },
              ]}
            />
            {q.source === "手書き図面" && (
              <p className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-2.5 text-xs text-amber-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                手書き図面からの読み取りです。管底高・立坑位置は目視で再確認してください。
              </p>
            )}
          </Card>

          <Card title="参照した資料">
            <ul className="space-y-2">
              {p.references.map((r) => (
                <li key={r.page + r.label} className="flex items-start gap-2 text-sm">
                  {r.doc === "判断履歴" ? (
                    <GraduationCap size={16} className="mt-0.5 shrink-0 text-navy-500" />
                  ) : (
                    <BookOpen size={16} className="mt-0.5 shrink-0 text-navy-500" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">{r.label}</p>
                    <p className="text-xs text-slate-500">
                      {r.doc} ・ {r.page}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* 中央：AI回答案 */}
        <div className="space-y-6 lg:col-span-2">
          <Card
            title={
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-navy-600" /> AI 回答案（弟子の提案）
              </span>
            }
            action={<Confidence value={p.confidence} />}
          >
            <div className="flex flex-wrap items-center gap-5">
              <FitBadge fit={p.fit} size="lg" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">提案機種</p>
                <p className="text-lg font-bold text-slate-900">{p.machine}</p>
              </div>
              <div className="grid grid-cols-3 gap-6 text-right">
                <div>
                  <p className="text-xs text-slate-500">概算費用</p>
                  <p className="text-base font-bold tabular-nums text-slate-900">{yen(p.estimate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">日進量</p>
                  <p className="text-base font-bold tabular-nums text-slate-900">{p.dailyAdvance} m/日</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">想定工期</p>
                  <p className="text-base font-bold tabular-nums text-slate-900">{p.durationDays} 日</p>
                </div>
              </div>
            </div>

            {p.deviationFromSpec && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <MessageSquareWarning size={14} /> 仕様書との差分（経験値に基づく判断）
                </p>
                <p className="mt-1 text-sm text-amber-900">{p.deviationFromSpec}</p>
                <p className="mt-2 text-xs text-amber-700">
                  → この差分は「標準化・仕様への昇格」候補として集計されています。
                  <Link href="/knowledge" className="ml-1 underline">
                    候補を見る
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-slate-700">判断の根拠</p>
                <ol className="mt-2 space-y-2">
                  {p.rationale.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[11px] font-bold text-navy-700">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">注意点・確認事項</p>
                {p.cautions.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">特記事項なし</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {p.cautions.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>

          {/* 担当者の確認 */}
          <Card title="担当者の確認（師匠のチェック）">
            {!isPending ? (
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={q.status} />
                  <span className="text-xs text-slate-500">{q.reviewer}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{q.reviewerNote}</p>
                {q.learnedDelta && (
                  <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
                    <p className="flex items-center gap-2 text-xs font-bold text-sky-800">
                      <GraduationCap size={14} /> 学習キューに登録された差分
                    </p>
                    <p className="mt-1 text-sm text-sky-900">{q.learnedDelta}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary">
                    <FileText size={14} /> 回答書を出力（PDF）
                  </Button>
                  <Button variant="ghost" onClick={() => reopen(q.id)}>
                    <RotateCcw size={14} /> 確認待ちに戻す
                  </Button>
                </div>
              </div>
            ) : mode === null ? (
              <div>
                <p className="text-sm text-slate-600">
                  AI回答案を確認し、処理を選択してください。修正した内容は学習キューに入り、次回以降の回答案に反映されます。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => setMode("approve")}>
                    <Check size={16} /> これでよい（承認）
                  </Button>
                  <Button variant="secondary" onClick={() => setMode("revise")}>
                    <PencilLine size={16} /> 修正して回答
                  </Button>
                  <Button variant="danger" onClick={() => setMode("escalate")}>
                    <MessageSquareWarning size={16} /> 現場経験者・協会へ相談
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Chip tone={mode === "approve" ? "green" : mode === "revise" ? "navy" : "rose"}>
                    {mode === "approve" ? "承認" : mode === "revise" ? "修正して回答" : "相談"}
                  </Chip>
                  <span className="text-xs text-slate-500">{q.reviewer ?? "積算担当 A"} として処理します</span>
                </div>
                <label className="block text-xs font-medium text-slate-700">
                  {mode === "approve" ? "コメント（任意）" : mode === "revise" ? "修正内容・依頼元への回答" : "相談内容・相談先"}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder={
                      mode === "revise"
                        ? "例：地下水位が高いため薬液注入を必須として回答。工期 +2日。"
                        : mode === "escalate"
                          ? "例：礫径 80mm は判断が割れるため、協会 技術委員へ相談。"
                          : "例：AI回答案どおりでOK。"
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-500"
                  />
                </label>
                {mode === "revise" && (
                  <label className="block text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} className="text-sky-600" /> 弟子に教える判断ルール（学習キューへ登録）
                    </span>
                    <input
                      value={delta}
                      onChange={(e) => setDelta(e.target.value)}
                      placeholder="例：条件 A × 条件 B のとき → 判断 C とする"
                      className="mt-1 w-full rounded-lg border border-sky-300 bg-sky-50/40 p-2.5 text-sm outline-none focus:border-sky-500"
                    />
                  </label>
                )}
                <div className="flex gap-2">
                  <Button onClick={submit} disabled={mode !== "approve" && note.trim() === ""}>
                    確定
                  </Button>
                  <Button variant="ghost" onClick={() => setMode(null)}>
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
