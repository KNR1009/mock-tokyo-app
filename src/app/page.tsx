"use client";

import Link from "next/link";
import { ArrowRight, Clock, GraduationCap, Inbox, ThumbsUp, Wallet } from "lucide-react";
import { Card, Chip, Confidence, FitBadge, PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { useInquiries } from "@/lib/inquiry-store";
import { dashboardStats as s, phases, qualityIssues, knowledgeCandidates } from "@/lib/mock-data";
import { dateTime, yen } from "@/lib/format";

const phaseTone = { 稼働中: "green", プレビュー: "amber", 構想: "slate" } as const;

export default function DashboardPage() {
  const { inquiries } = useInquiries();
  const pending = inquiries.filter((q) => q.status === "pending_review");
  const learned = inquiries.filter((q) => q.learnedDelta).length + s.learningQueue - 1;
  const openIssues = qualityIssues.filter((i) => !i.resolved).length;
  const proposals = knowledgeCandidates.filter((k) => k.status === "提案中" || k.status === "採用予定").length;

  return (
    <>
      <PageHeader
        eyebrow="2026-09-12（土）"
        title="ダッシュボード"
        description="AIが回答案を出し、担当者が「これでよい」と確認する運用。担当者の判断は学習キューへ蓄積され、翌年度の積算資料・仕様書づくりに反映されます。"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="本日の問い合わせ" value={s.todayInquiries} sub="うち 事前相談 3件" icon={<Inbox size={16} />} />
        <StatCard label="AI回答案 確認待ち" value={pending.length} sub="担当者の確認が必要" icon={<Clock size={16} />} tone="amber" />
        <StatCard
          label="修正なし承認率（30日）"
          value={`${s.approvedWithoutEdit}%`}
          sub="AI回答案がそのまま採用された割合"
          icon={<ThumbsUp size={16} />}
          tone="green"
        />
        <StatCard
          label="一次回答までの平均時間"
          value={`${s.avgFirstAnswerMin}分`}
          sub={`従来 ${s.legacyAvgFirstAnswerMin}分 → 電話待ちを解消`}
          icon={<GraduationCap size={16} />}
          tone="sky"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="確認待ちの AI 回答案"
          action={
            <Link href="/inquiries" className="flex items-center gap-1 text-xs font-medium text-navy-700 hover:underline">
              すべて見る <ArrowRight size={14} />
            </Link>
          }
        >
          {pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">確認待ちの回答案はありません。</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((q) => (
                <li key={q.id}>
                  <Link href={`/inquiries/${q.id}`} className="flex items-center gap-4 py-3 hover:bg-slate-50">
                    <FitBadge fit={q.proposal.fit} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{q.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {q.client} ・ {dateTime(q.receivedAt)} 受付 ・ {q.source}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-slate-500">{q.proposal.machine.split("（")[0]}</p>
                      <Confidence value={q.proposal.confidence} />
                    </div>
                    <StatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="弟子（AI）の学習状況">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">学習キュー（担当者の修正差分）</span>
                <span className="font-bold text-slate-900">{learned}件</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">標準仕様への昇格提案</span>
                <Link href="/knowledge" className="font-bold text-navy-700 hover:underline">
                  {proposals}件
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">資料の未解決指摘</span>
                <Link href="/quality" className="font-bold text-rose-700 hover:underline">
                  {openIssues}件
                </Link>
              </div>
            </div>
          </Card>

          <Card title="今月の AI 利用コスト">
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">{yen(s.monthlyUsed)}</p>
              <p className="text-xs text-slate-500">上限 {yen(s.monthlyBudget)}</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-navy-600" style={{ width: `${(s.monthlyUsed / s.monthlyBudget) * 100}%` }} />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <Wallet size={12} /> 従量課金の高騰を防ぐため、月額上限と利用者別上限を設定しています
            </p>
          </Card>
        </div>
      </div>

      <Card className="mt-6" title="フェーズ定義（理想像を描いた上で、今回はこのパーツ）">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {phases.map((p) => (
            <Link
              key={p.no}
              href={p.href}
              className="group rounded-lg border border-slate-200 p-4 transition hover:border-navy-300 hover:bg-navy-50/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-700">{p.no}フェーズ</span>
                <Chip tone={phaseTone[p.status]}>{p.status}</Chip>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{p.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.scope}</p>
              <p className="mt-3 text-[11px] text-slate-500">
                期間 {p.period} ／ 投資 {p.budget}
              </p>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
