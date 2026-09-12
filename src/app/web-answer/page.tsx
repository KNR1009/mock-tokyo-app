"use client";

import { useState } from "react";
import { Bot, Database, Globe, Send, ShieldCheck, User } from "lucide-react";
import { Button, Card, Chip, PageHeader } from "@/components/ui";

interface Msg {
  role: "user" | "ai";
  text: string;
}

const initial: Msg[] = [
  {
    role: "user",
    text: "φ200 の下水道本管を 40m ほど推進したいのですが、砂質土でベビーモール工法は使えますか？",
  },
  {
    role: "ai",
    text: "はい、φ200・延長 40m・砂質土であれば、BM-M型 小口径削進機の標準適用範囲内です。\n\n■ 目安\n・日進量：約 8m/日\n・想定工期：5〜6日（据付・撤去含む）\n\n■ 確認が必要な点\n・地下水位が管底より高い場合は補助工法（薬液注入）の検討が必要です\n・到達側が既設人孔の場合、コア抜き径は管径 +100mm が標準です\n\n詳細な積算や図面をお持ちの場合は、協会へお送りいただければ担当者が確認のうえ回答します。",
  },
];

const canned: Record<string, string> = {
  default:
    "ご質問ありがとうございます。一次回答として、条件（管径・延長・土質・地下水位）をお知らせいただければ、適用可否の目安をお答えできます。\n\n確定的な判断が必要な場合は、下の「協会へ相談する」からお問い合わせください。担当者が図面を確認して回答します。",
  礫: "礫が混じる地盤では、礫径によって機種が変わります。\n・礫径 20mm 以下：BM-S型／BM-M型 で対応可\n・礫径 20〜60mm：BM-R型（礫対応）を推奨\n・礫径 60mm 超：施工実績が限られるため、協会へ個別にご相談ください\n\n柱状図があれば、より正確な目安をお伝えできます。",
};

export default function WebAnswerPage() {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = text.includes("礫") ? canned["礫"] : canned.default;
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <>
      <PageHeader
        eyebrow="売上寄与"
        title="Web 一次回答"
        phase="第3フェーズ（構想）"
        description="着手前の「これはできますか？」という気軽な相談に、協会サイト上で AI が一次回答します。「これならできる」と分かれば、やってみようという設計者・工事会社が増え、案件の入口を広げます。"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 !p-0">
          <div className="-m-5">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
              <Globe size={14} />
              <span className="font-mono">babymole-assoc.example.jp/consult</span>
              <Chip tone="green">公開プレビュー</Chip>
            </div>
            <div className="h-[460px] space-y-4 overflow-y-auto p-5">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "ai" && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-700 text-white">
                      <Bot size={16} />
                    </span>
                  )}
                  <div
                    className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user" ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <User size={16} />
                    </span>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-white">
                    <Bot size={16} />
                  </span>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">回答を作成しています…</div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && send()}
                  placeholder="例：礫混じりの地盤で φ150 は施工できますか？"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-navy-500"
                />
                <Button onClick={send} disabled={typing}>
                  <Send size={14} /> 送信
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                ※ AI による一次回答です。確定判断は協会担当者が行います。個人情報・図面は入力しないでください。
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="公開にあたってのルール">
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                回答は「目安」に限定し、確定積算は担当者確認へ誘導
              </li>
              <li className="flex gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                1 IP あたり 1日 20問の上限（従量課金の高騰防止）
              </li>
              <li className="flex gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                公開ナレッジは社内版と分離（未公開の判断履歴は参照しない）
              </li>
              <li className="flex gap-2">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                協会内の合意プロセスを経て公開範囲を決定
              </li>
            </ul>
          </Card>

          <Card
            title={
              <span className="flex items-center gap-2">
                <Database size={14} /> AI 向け積算データセット
              </span>
            }
          >
            <p className="text-sm text-slate-700">
              人間が読む冊子とは別に、他社 CAD 搭載 AI やクローラーが読むための構造化データ（機種・適用範囲・歩掛）を整備します。大手 CAD 上で比較選定される際に自社機械が選ばれるための基盤です。
            </p>
            <div className="mt-3 rounded-lg bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
              {`{\n  "machine": "BM-M",\n  "pipe_diameter_mm": [200, 250],\n  "max_length_m": 60,\n  "soil": ["sand", "clay"],\n  "advance_m_per_day": 8\n}`}
            </div>
            <Button variant="secondary" className="mt-3 w-full">
              データセットの公開設定
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
