"use client";

import { useState } from "react";
import { Activity, ArrowLeftRight, Database, KeyRound, ShieldAlert } from "lucide-react";
import { Button, Card, Chip, PageHeader } from "@/components/ui";
import { modelProviders, dashboardStats as s } from "@/lib/mock-data";
import { yen } from "@/lib/format";

const roleTone = { 主系: "green", 副系: "navy", "緊急予備（ローカル）": "amber" } as const;
const statusTone = { 稼働中: "green", 待機: "slate", 障害: "rose" } as const;

const users = [
  { name: "積算担当 A", cap: 20_000, used: 11_800 },
  { name: "積算担当 B（後継）", cap: 15_000, used: 5_240 },
  { name: "重盛社長", cap: 10_000, used: 1_200 },
  { name: "協会 技術委員", cap: 5_000, used: 0 },
];

export default function SettingsPage() {
  const [primary, setPrimary] = useState("claude");

  return (
    <>
      <PageHeader
        eyebrow="単一ツール依存を避ける"
        title="モデル接続・利用上限"
        description="自社側の Web アプリを窓口に、裏側で複数の AI API に接続します。接続先を切り替えられるため、モデルの提供終了・通信障害時のバックアップになります。ナレッジは特定ツールに閉じさせず、自社の資産として保持します。"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="接続先モデル（切替可能）">
          <div className="space-y-3">
            {modelProviders.map((m) => {
              const isPrimary = primary === m.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-wrap items-center gap-4 rounded-lg border p-4 ${
                    isPrimary ? "border-navy-300 bg-navy-50/40" : "border-slate-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{m.name}</p>
                      <Chip tone={roleTone[m.role]}>{isPrimary ? "主系" : m.role === "主系" ? "副系" : m.role}</Chip>
                      <Chip tone={statusTone[m.status]}>{m.status}</Chip>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{m.vendor}</p>
                    <p className="mt-1.5 text-xs text-slate-600">{m.note}</p>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <p className="flex items-center justify-end gap-1">
                      <Activity size={12} /> 応答 {(m.latencyMs / 1000).toFixed(1)}秒
                    </p>
                    <p className="mt-1">今月 {yen(m.monthlyCost)}</p>
                  </div>
                  <Button variant={isPrimary ? "secondary" : "primary"} disabled={isPrimary} onClick={() => setPrimary(m.id)}>
                    <ArrowLeftRight size={14} /> {isPrimary ? "主系" : "主系に切替"}
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-bold text-slate-700">二段構えの運用</p>
            <p className="mt-1">
              基本はフロンティアモデル（Claude／GPT）、外部 API 断時のみローカル小型モデルへ自動フォールバック。ローカルは「ぎりぎり受け答えできる予備」であり、精度は限定的です。
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            title={
              <span className="flex items-center gap-2">
                <Database size={14} /> ナレッジの保管
              </span>
            }
          >
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">積算資料・仕様書</span>
                <span className="font-medium">自社ストレージ</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">判断履歴（412件）</span>
                <span className="font-medium">自社 DB</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-500">学習キュー</span>
                <span className="font-medium">自社 DB</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-500">モデル側への学習</span>
                <span className="font-medium text-emerald-700">なし（データ非送信）</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              データベース役と生成役を分離。モデルを切り替えてもナレッジは失われません。
            </p>
          </Card>

          <Card
            title={
              <span className="flex items-center gap-2">
                <KeyRound size={14} /> セキュリティ
              </span>
            }
          >
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5 shrink-0 text-emerald-600" /> API キーはサーバー側で保管・90日ごとに更新
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5 shrink-0 text-emerald-600" /> 依頼元の個人情報はマスクして送信
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5 shrink-0 text-emerald-600" /> 社内版と Web 公開版のナレッジを分離
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Card className="mt-6" title="利用上限（従量課金の高騰防止）">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">今月の合計</p>
            <p className="text-2xl font-bold tabular-nums text-slate-900">
              {yen(s.monthlyUsed)} <span className="text-sm font-normal text-slate-500">/ 上限 {yen(s.monthlyBudget)}</span>
            </p>
          </div>
          <Button variant="secondary">上限を変更</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left font-medium">利用者</th>
                <th className="py-2 text-left font-medium">利用状況</th>
                <th className="py-2 text-right font-medium">今月</th>
                <th className="py-2 text-right font-medium">上限</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const pct = Math.round((u.used / u.cap) * 100);
                return (
                  <tr key={u.name}>
                    <td className="py-2.5 font-medium text-slate-800">{u.name}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-full ${pct > 80 ? "bg-rose-500" : "bg-navy-600"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-slate-500">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{yen(u.used)}</td>
                    <td className="py-2.5 text-right tabular-nums text-slate-500">{yen(u.cap)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
