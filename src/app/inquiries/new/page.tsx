"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileText,
  FileUp,
  Image as ImageIcon,
  Loader2,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { Button, Card, Chip, FitBadge, PageHeader } from "@/components/ui";
import { useInquiries } from "@/lib/inquiry-store";
import { knowledgeSources } from "@/lib/mock-data";
import { yen } from "@/lib/format";
import type { Inquiry, NewInquiryInput, UploadKind, UploadedFile } from "@/lib/types";

type Step = 1 | 2 | 3;

const sampleFiles: Record<UploadKind, Omit<UploadedFile, "id" | "readStatus">> = {
  設計図面: { kind: "設計図面", name: "下水道本管新設_平面縦断図_No5-No6.pdf", size: "4.2 MB" },
  "柱状図（地質調査）": { kind: "柱状図（地質調査）", name: "地質調査報告書_B-3柱状図.pdf", size: "1.8 MB" },
  "条件表（Excel）": { kind: "条件表（Excel）", name: "施工条件一覧_No5-No6.xlsx", size: "86 KB" },
  電話メモ: { kind: "電話メモ", name: "電話メモ（テキスト入力）", size: "—" },
};

const kindIcon: Record<UploadKind, React.ComponentType<{ size?: number; className?: string }>> = {
  設計図面: ImageIcon,
  "柱状図（地質調査）": FileText,
  "条件表（Excel）": FileSpreadsheet,
  電話メモ: Phone,
};

// 資料を読み取ったときに埋まる想定の条件（モック）
const extractedFromFiles: Partial<NewInquiryInput> = {
  pipeDiameter: 250,
  length: 58,
  soil: "砂質土 → 礫混じり砂（GL-4.0m 以深、最大礫径 35mm）",
  nValue: "N=12〜25",
  groundwater: "GL-2.3m",
  shaft: "発進立坑 φ2.5m ／ 到達立坑 φ2.0m",
};

const genSteps = [
  { key: "read", label: "アップロード資料の読み取り（図面・柱状図・条件表）" },
  { key: "spec", label: "積算資料 2026年版・参考資料（仕様書）との照合" },
  { key: "history", label: "過去の判断履歴 412件から類似案件を検索" },
  { key: "reason", label: "機種提案・概算・根拠・注意点の生成" },
];

const empty: NewInquiryInput = {
  client: "",
  clientType: "自治体",
  workType: "本管新設（推進）",
  pipeDiameter: 0,
  length: 0,
  soil: "",
  nValue: "",
  groundwater: "",
  shaft: "",
  source: "PDF図面",
  memo: "",
};

export default function NewInquiryPage() {
  const router = useRouter();
  const { addInquiry } = useInquiries();
  const [step, setStep] = useState<Step>(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [form, setForm] = useState<NewInquiryInput>(empty);
  const [genIndex, setGenIndex] = useState(-1); // -1: 未開始, 0..3: 進行中, 4: 完了
  const [created, setCreated] = useState<Inquiry | null>(null);

  const activeSources = knowledgeSources.filter((s) => s.status === "取込済み");
  const set = <K extends keyof NewInquiryInput>(k: K, v: NewInquiryInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addFile = (kind: UploadKind) => {
    if (files.some((f) => f.kind === kind)) return;
    const id = kind; // 種別ごとに 1 ファイル
    setFiles((prev) => [...prev, { id, readStatus: "読み取り中", ...sampleFiles[kind] }]);
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                readStatus: kind === "設計図面" ? "要確認" : "読み取り完了",
                note:
                  kind === "設計図面"
                    ? "管底高（発進）の数値がかすれており信頼度 71%。次のステップで確認してください"
                    : kind === "柱状図（地質調査）"
                      ? "GL-4.0m 以深に礫混じり砂（最大礫径 35mm）を検出"
                      : undefined,
              }
            : f,
        ),
      );
      // 読み取り結果を条件フォームへ反映
      setForm((f) => ({
        ...f,
        ...(kind === "設計図面" && {
          pipeDiameter: extractedFromFiles.pipeDiameter!,
          length: extractedFromFiles.length!,
          shaft: extractedFromFiles.shaft!,
          source: "PDF図面" as const,
        }),
        ...(kind === "柱状図（地質調査）" && {
          soil: extractedFromFiles.soil!,
          nValue: extractedFromFiles.nValue!,
          groundwater: extractedFromFiles.groundwater!,
        }),
        ...(kind === "条件表（Excel）" && {
          client: f.client || "◎◎市 下水道課",
          source: (files.some((x) => x.kind === "設計図面") ? "PDF図面" : "Excel") as NewInquiryInput["source"],
        }),
      }));
    }, 1400);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const reading = files.some((f) => f.readStatus === "読み取り中");
  const canProceed1 = files.length > 0 && !reading;
  const canGenerate = form.client && form.pipeDiameter > 0 && form.length > 0 && form.soil;

  // 生成の進行（モック）：各ステップ 0.9 秒。最後に案件を登録する
  useEffect(() => {
    if (genIndex < 0 || genIndex > genSteps.length) return;
    const t = setTimeout(() => {
      if (genIndex === genSteps.length) setCreated(addInquiry(form));
      else setGenIndex((i) => i + 1);
    }, genIndex === genSteps.length ? 300 : 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genIndex]);

  const startGenerate = () => {
    setStep(3);
    setGenIndex(0);
  };

  return (
    <>
      <Link href="/inquiries" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> 一覧へ戻る
      </Link>
      <PageHeader
        eyebrow="AIの弟子入り"
        title="新規案件の登録"
        phase="第1フェーズ"
        description="届いた資料をアップロードすると、AI が条件を読み取り、登録済みの積算資料・仕様書・過去の判断履歴と照らし合わせて回答案を作成します。回答案は「確認待ち」として一覧に追加されます。"
      />

      {/* ステッパー */}
      <ol className="mb-6 flex items-center gap-2 text-sm">
        {[
          { n: 1, label: "資料をアップロード" },
          { n: 2, label: "読み取った条件を確認" },
          { n: 3, label: "AI 回答案を生成" },
        ].map((s, i) => (
          <li key={s.n} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step > s.n ? "bg-emerald-600 text-white" : step === s.n ? "bg-navy-700 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {step > s.n ? <Check size={14} /> : s.n}
            </span>
            <span className={step === s.n ? "font-semibold text-slate-900" : "text-slate-500"}>{s.label}</span>
            {i < 2 && <span className="mx-2 h-px w-10 bg-slate-300" />}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Card title="① 案件の資料をアップロード">
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <FileUp size={32} className="mx-auto text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-800">図面・柱状図・条件表をここにドロップ</p>
                  <p className="mt-1 text-xs text-slate-500">PDF / JPG / PNG / DXF / Excel（1ファイル 50MB まで）</p>
                  <p className="mt-3 text-xs text-slate-500">モックのためサンプルを追加できます：</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {(Object.keys(sampleFiles) as UploadKind[])
                      .filter((k) => k !== "電話メモ")
                      .map((k) => (
                        <Button key={k} variant="secondary" onClick={() => addFile(k)} disabled={files.some((f) => f.kind === k)}>
                          ＋ {k}
                        </Button>
                      ))}
                  </div>
                </div>

                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {files.map((f) => {
                      const Icon = kindIcon[f.kind];
                      return (
                        <li key={f.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                          <span className="rounded-lg bg-navy-50 p-2 text-navy-700">
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Chip tone="navy">{f.kind}</Chip>
                              <p className="truncate text-sm font-medium text-slate-900">{f.name}</p>
                              <span className="text-xs text-slate-500">{f.size}</span>
                            </div>
                            <p className="mt-1 flex items-center gap-1.5 text-xs">
                              {f.readStatus === "読み取り中" && (
                                <>
                                  <Loader2 size={12} className="animate-spin text-navy-600" />
                                  <span className="text-slate-600">AI が内容を読み取っています…</span>
                                </>
                              )}
                              {f.readStatus === "読み取り完了" && (
                                <>
                                  <CheckCircle2 size={12} className="text-emerald-600" />
                                  <span className="text-emerald-700">読み取り完了</span>
                                </>
                              )}
                              {f.readStatus === "要確認" && (
                                <>
                                  <CheckCircle2 size={12} className="text-amber-500" />
                                  <span className="text-amber-700">読み取り完了（要確認あり）</span>
                                </>
                              )}
                              {f.note && <span className="text-slate-500">— {f.note}</span>}
                            </p>
                          </div>
                          <button onClick={() => removeFile(f.id)} className="text-slate-400 hover:text-rose-600" title="削除">
                            <X size={16} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card title="② 依頼元・電話メモ（任意）">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-xs font-medium text-slate-700">
                    依頼元
                    <input
                      value={form.client}
                      onChange={(e) => set("client", e.target.value)}
                      placeholder="例：◎◎市 下水道課"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-navy-500"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-700">
                    区分
                    <select
                      value={form.clientType}
                      onChange={(e) => set("clientType", e.target.value as NewInquiryInput["clientType"])}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-navy-500"
                    >
                      <option>自治体</option>
                      <option>設計事務所</option>
                      <option>協会加盟工事会社</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-slate-700">
                    工種
                    <select
                      value={form.workType}
                      onChange={(e) => set("workType", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-navy-500"
                    >
                      <option>本管新設（推進）</option>
                      <option>取付管（推進）</option>
                      <option>事前相談</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-slate-700 md:col-span-2">
                    電話メモ（資料がない場合はここに聞き取った条件を入力）
                    <textarea
                      value={form.memo}
                      onChange={(e) => set("memo", e.target.value)}
                      rows={2}
                      placeholder="例：φ250 で 40m ほど。土質は不明、ボーリング未実施。来月着手したい。"
                      className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-navy-500"
                    />
                  </label>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!canProceed1 && !form.memo}>
                  次へ：読み取った条件を確認 <ArrowRight size={14} />
                </Button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Card title="読み取った条件（編集できます）">
                <p className="mb-4 text-sm text-slate-600">
                  資料から AI が読み取った値です。オレンジの項目は信頼度が低いため、元の資料と見比べて修正してください。
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="依頼元" value={form.client} onChange={(v) => set("client", v)} placeholder="例：◎◎市 下水道課" />
                  <label className="text-xs font-medium text-slate-700">
                    入力形式
                    <select
                      value={form.source}
                      onChange={(e) => set("source", e.target.value as NewInquiryInput["source"])}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none focus:border-navy-500"
                    >
                      <option>PDF図面</option>
                      <option>手書き図面</option>
                      <option>Excel</option>
                      <option>電話</option>
                    </select>
                  </label>
                  <Field
                    label="管径（mm）"
                    value={form.pipeDiameter || ""}
                    onChange={(v) => set("pipeDiameter", Number(v))}
                    type="number"
                    placeholder="例：250"
                  />
                  <Field
                    label="推進延長（m）"
                    value={form.length || ""}
                    onChange={(v) => set("length", Number(v))}
                    type="number"
                    placeholder="例：58"
                  />
                  <Field label="土質" value={form.soil} onChange={(v) => set("soil", v)} placeholder="例：砂質土（細砂主体）" className="md:col-span-2" />
                  <Field label="N値" value={form.nValue} onChange={(v) => set("nValue", v)} placeholder="例：N=8〜12" />
                  <Field label="地下水位" value={form.groundwater} onChange={(v) => set("groundwater", v)} placeholder="例：GL-2.1m" />
                  <Field
                    label="立坑"
                    value={form.shaft}
                    onChange={(v) => set("shaft", v)}
                    placeholder="例：発進立坑 φ2.5m ／ 到達立坑 φ2.0m"
                    className="md:col-span-2"
                    warn={files.some((f) => f.kind === "設計図面")}
                    warnText="管底高（発進）の読み取り信頼度 71%。図面を目視で確認してください"
                  />
                </div>
              </Card>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> 戻る
                </Button>
                <Button onClick={startGenerate} disabled={!canGenerate}>
                  <Sparkles size={14} /> AI 回答案を生成
                </Button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <Card
              title={
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-navy-600" /> AI 回答案を生成しています
                </span>
              }
            >
              <ol className="space-y-3">
                {genSteps.map((g, i) => {
                  const state = i < genIndex ? "done" : i === genIndex ? "running" : "todo";
                  return (
                    <li key={g.key} className="flex items-center gap-3 text-sm">
                      {state === "done" && <CheckCircle2 size={18} className="text-emerald-600" />}
                      {state === "running" && <Loader2 size={18} className="animate-spin text-navy-600" />}
                      {state === "todo" && <span className="h-[18px] w-[18px] rounded-full border-2 border-slate-300" />}
                      <span className={state === "todo" ? "text-slate-400" : "text-slate-800"}>{g.label}</span>
                      {g.key === "history" && state === "done" && <Chip tone="navy">類似 11件</Chip>}
                    </li>
                  );
                })}
              </ol>

              {created && (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <CheckCircle2 size={16} /> 回答案を作成し、「確認待ち」として一覧に追加しました
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <FitBadge fit={created.proposal.fit} size="lg" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">{created.id}</p>
                      <p className="text-base font-bold text-slate-900">{created.title}</p>
                      <p className="text-sm text-slate-700">
                        {created.proposal.machine} ・ 信頼度 {created.proposal.confidence}% ・ 概算 {yen(created.proposal.estimate)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => router.push(`/inquiries/${created.id}`)}>回答案を確認する（詳細へ）</Button>
                    <Button variant="secondary" onClick={() => router.push("/inquiries")}>
                      一覧へ
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* 右：AI が参照するデータ */}
        <div className="space-y-6">
          <Card
            title={
              <span className="flex items-center gap-2">
                <Database size={14} /> AI が照らし合わせる参照データ
              </span>
            }
            action={
              <Link href="/sources" className="text-xs font-medium text-navy-700 hover:underline">
                管理画面へ
              </Link>
            }
          >
            <ul className="space-y-2">
              {activeSources.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-sm">
                  <BookOpen size={14} className="mt-0.5 shrink-0 text-navy-500" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {s.category} ・ {s.volume}
                      {s.version && ` ・ ${s.version}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              回答案の「判断の根拠」「参照した資料」は、ここに登録されたデータから引用されます。古い仕様のデータは除外されています。
            </p>
          </Card>

          <Card title="必要な資料">
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2"><Chip tone="rose">必須</Chip> 設計図面（平面図・縦断図）… 管径・延長・立坑</li>
              <li className="flex gap-2"><Chip tone="amber">推奨</Chip> 柱状図（地質調査）… 土質・N値・地下水位・礫径</li>
              <li className="flex gap-2"><Chip tone="slate">任意</Chip> 条件表（Excel）… 依頼元・工期希望など</li>
              <li className="flex gap-2"><Chip tone="slate">任意</Chip> 電話メモ … 資料が届く前の事前相談</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">柱状図がない場合は標準土質を仮定した「暫定判定」になります（信頼度は下がります）。</p>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  warn,
  warnText,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  warn?: boolean;
  warnText?: string;
}) {
  return (
    <label className={`text-xs font-medium text-slate-700 ${className}`}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-lg border p-2 text-sm outline-none focus:border-navy-500 ${
          warn ? "border-amber-300 bg-amber-50/40" : "border-slate-300"
        }`}
      />
      {warn && warnText && <span className="mt-1 block text-[11px] font-normal text-amber-700">{warnText}</span>}
    </label>
  );
}
