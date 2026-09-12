import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardCheck,
  Globe,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  MessageSquareWarning,
  PencilLine,
  ScanSearch,
  Settings,
  Video,
  BookOpenCheck,
} from "lucide-react";
import { Card, Chip, FitBadge, PageHeader, StatusBadge } from "@/components/ui";

const toc = [
  { id: "intro", label: "1. このシステムでできること" },
  { id: "screen", label: "2. 画面の見方" },
  { id: "daily", label: "3. 1日の基本の流れ" },
  { id: "inquiries", label: "4. 積算判定アシストの使い方" },
  { id: "others", label: "5. その他の画面の使い方" },
  { id: "glossary", label: "6. 用語集" },
  { id: "faq", label: "7. 困ったときは" },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-3 border-l-4 border-navy-700 pl-3 text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Step({ no, title, children }: { no: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-white">
        {no}
      </span>
      <div className="flex-1 pt-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <div className="mt-1 text-sm leading-relaxed text-slate-700">{children}</div>
      </div>
    </li>
  );
}

function Tip({ children, tone = "navy" }: { children: ReactNode; tone?: "navy" | "amber" }) {
  const t =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-navy-200 bg-navy-50 text-navy-800";
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${t}`}>
      {tone === "amber" ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <HelpCircle size={16} className="mt-0.5 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}

const menuGuide = [
  { icon: LayoutDashboard, name: "ダッシュボード", href: "/", desc: "今日の件数や確認待ちの案件が一目でわかる「ホーム画面」。朝はまずここを開きます。" },
  { icon: Inbox, name: "積算判定アシスト", href: "/inquiries", desc: "届いた問い合わせに対する AI の回答案を確認する、いちばんよく使う画面。オレンジの数字は「確認待ちの件数」です。" },
  { icon: ClipboardCheck, name: "資料 品質チェック", href: "/quality", desc: "積算資料・仕様書の数値の抜けや矛盾を AI が見つけて教えてくれます。" },
  { icon: BookOpenCheck, name: "標準化・仕様への昇格", href: "/knowledge", desc: "担当者が何度も同じ判断をしている「経験ルール」を、来年度の資料に入れるか決める画面。" },
  { icon: ScanSearch, name: "図面直読", href: "/drawings", desc: "図面をアップロードすると条件を読み取ります（第2フェーズのプレビュー）。" },
  { icon: Globe, name: "Web 一次回答", href: "/web-answer", desc: "協会サイトで AI が一次回答する画面のイメージ（第3フェーズの構想）。" },
  { icon: Video, name: "動画マニュアル生成", href: "/manuals", desc: "作業動画から手順書を自動で作ります。現場の引継ぎ・新人教育用。" },
  { icon: Settings, name: "モデル接続・利用上限", href: "/settings", desc: "AI の接続先の切替や、月の利用上限を管理します。通常は触りません。" },
];

const glossary = [
  { term: "AI 回答案（弟子の提案）", desc: "AI が積算資料・仕様書・過去の判断履歴をもとに作った「たたき台」。そのまま採用してもよいし、直してもよい。最終判断は必ず人（担当者）が行います。" },
  { term: "師匠／弟子", desc: "担当者＝師匠、AI＝弟子。AI は担当者の判断を見て学ぶ「弟子」であり、担当者の仕事を置き換えるものではありません。" },
  { term: "適合（◎ ○ △ ×）", desc: "提案した機種がその現場にどれくらい合っているか。◎＝標準条件そのもの、○＝適用範囲内だが注意点あり、△＝条件によっては難しい／変更提案あり、×＝適用外。" },
  { term: "信頼度（%）", desc: "AI が自分の回答にどれくらい自信があるか。85% 以上は緑、70〜84% は青、70% 未満はオレンジ。オレンジのときは特に丁寧に確認してください。" },
  { term: "仕様書との差分", desc: "仕様書には「できる」と書いてあるが、経験上は別の判断になるケース。黄色い枠で表示されます。" },
  { term: "学習キュー", desc: "担当者が AI の回答案を修正したとき、その「判断ルール」を貯めておく場所。貯まったルールは次の回答案に反映され、AI が育っていきます。" },
  { term: "昇格候補", desc: "学習キューの中で何度も繰り返されている判断。「これは標準仕様に入れてよいのでは」と AI が提案してきます。" },
  { term: "主系／副系／緊急予備", desc: "AI の接続先の役割。ふだんは主系（Claude）を使い、障害時は副系（GPT）、外部がすべて止まったときはローカルの緊急予備に切り替わります。" },
];

const faq = [
  {
    q: "AI の回答案が明らかに間違っている気がします。",
    a: "「修正して回答」を選び、正しい内容と「弟子に教える判断ルール」を書いて確定してください。間違いを直すほど AI は賢くなります。自分で判断できないときは「現場経験者・協会へ相談」を選べば OK です。",
  },
  {
    q: "間違えて「承認」してしまいました。",
    a: "案件の詳細画面を開き、「確認待ちに戻す」を押せば元に戻ります。そのあと改めて処理し直してください。",
  },
  {
    q: "信頼度がオレンジ（70% 未満）の案件はどうすればいいですか？",
    a: "AI 自身が自信を持てていない案件です。「判断の根拠」と「注意点」をよく読み、迷う場合は承認せずに「現場経験者・協会へ相談」を選んでください。",
  },
  {
    q: "手書き図面の案件で黄色い注意が出ています。",
    a: "手書き図面は読み取り精度が落ちるため、管底高・立坑位置などを元の図面と目で見比べてから処理してください。",
  },
  {
    q: "画面の数字が最初の状態に戻ってしまいました。",
    a: "このモック版はブラウザを再読み込みすると初期データに戻ります（保存機能はありません）。本番版ではデータベースに保存されます。",
  },
  {
    q: "AI が止まって回答案が出ません。",
    a: "「モデル接続・利用上限」画面で接続先の状態を確認してください。主系が「障害」なら副系に切り替えます。切替方法が分からない場合は管理者に連絡してください。",
  },
];

export default function GuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="はじめての方へ"
        title="操作ガイド（システムマニュアル）"
        description="このシステムの目的・画面の見方・毎日の使い方を、新人の方でも迷わないようにまとめています。まず「1日の基本の流れ」だけ読めば使い始められます。"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* 目次 */}
        <nav className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <p className="mb-2 text-xs font-bold text-slate-500">目次</p>
            <ul className="space-y-1">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="block rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-navy-700">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </nav>

        <div className="space-y-10">
          {/* 1 */}
          <Section id="intro" title="1. このシステムでできること">
            <Card>
              <p className="text-sm leading-relaxed text-slate-700">
                役所や設計事務所から届く下水道の図面に対して、「どの機械が使えるか」「いくらかかるか」を判断する仕事を、
                <span className="font-bold text-navy-700">AI が下書き（回答案）を作り、担当者が確認する</span>
                形で進めるためのシステムです。
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-900">① AI が回答案を作る</p>
                  <p className="mt-1 text-xs text-slate-600">積算資料・仕様書・過去の判断を照らし合わせ、機種・概算・根拠を自動で作成。</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-900">② 担当者が確認する</p>
                  <p className="mt-1 text-xs text-slate-600">「これでよい」「修正する」「相談する」の 3 つから選ぶだけ。</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-900">③ AI が育つ</p>
                  <p className="mt-1 text-xs text-slate-600">修正した内容を AI が学び、次からの回答案が良くなる。繰り返す判断は標準仕様の候補に。</p>
                </div>
              </div>
              <Tip>
                <span className="font-bold">大切な考え方：</span>AI は「弟子」、担当者は「師匠」です。AI の答えをうのみにせず、必ず人が最終確認します。
                間違いを直すことが AI を育てることになるので、遠慮なく修正してください。
              </Tip>
            </Card>
          </Section>

          {/* 2 */}
          <Section id="screen" title="2. 画面の見方">
            <Card>
              <p className="mb-3 text-sm text-slate-700">左側のメニューから画面を切り替えます。ふだん使うのは上の 2 つ（ダッシュボード・積算判定アシスト）だけで十分です。</p>
              <ul className="divide-y divide-slate-100">
                {menuGuide.map(({ icon: Icon, name, href, desc }) => (
                  <li key={href} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 rounded-lg bg-navy-50 p-1.5 text-navy-700">
                      <Icon size={16} />
                    </span>
                    <div className="flex-1">
                      <Link href={href} className="text-sm font-bold text-navy-700 hover:underline">
                        {name}
                      </Link>
                      <p className="mt-0.5 text-sm text-slate-600">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="よく出てくるマークの意味">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-slate-500">適合（機種がどれくらい合っているか）</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-center gap-3"><FitBadge fit="◎" /> 標準条件そのもの。そのまま承認できることが多い</li>
                    <li className="flex items-center gap-3"><FitBadge fit="○" /> 適用範囲内。注意点を確認してから承認</li>
                    <li className="flex items-center gap-3"><FitBadge fit="△" /> 条件次第。変更提案が含まれることが多い</li>
                    <li className="flex items-center gap-3"><FitBadge fit="×" /> 適用外。別の工法を検討</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">案件の状態</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-center gap-3"><StatusBadge status="pending_review" /> あなたの確認を待っている</li>
                    <li className="flex items-center gap-3"><StatusBadge status="approved" /> AI の案どおりで回答済み</li>
                    <li className="flex items-center gap-3"><StatusBadge status="revised" /> 担当者が直して回答済み</li>
                    <li className="flex items-center gap-3"><StatusBadge status="escalated" /> 現場経験者・協会に相談中</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Section>

          {/* 3 */}
          <Section id="daily" title="3. 1日の基本の流れ">
            <Card>
              <ol className="space-y-5">
                <Step no={1} title="朝：ダッシュボードを開く">
                  「AI回答案 確認待ち」の件数を見ます。左メニューの「積算判定アシスト」にもオレンジの数字で同じ件数が出ています。
                </Step>
                <Step no={2} title="確認待ちの案件を上から順に開く">
                  ダッシュボードの「確認待ちの AI 回答案」の行をクリックすると、その案件の詳細が開きます。
                </Step>
                <Step no={3} title="AI 回答案を読む">
                  左の「図面・現場条件」と、右の「AI 回答案」を見比べます。特に <span className="font-bold">判断の根拠</span> と <span className="font-bold">注意点</span> を読んでください。
                </Step>
                <Step no={4} title="3 つのボタンから 1 つ選ぶ">
                  <span className="font-bold">これでよい（承認）</span>／<span className="font-bold">修正して回答</span>／<span className="font-bold">現場経験者・協会へ相談</span>。迷ったら「相談」で構いません。
                </Step>
                <Step no={5} title="確認待ちがゼロになったら終了">
                  時間があれば「資料 品質チェック」や「標準化・仕様への昇格」を見て、未処理の指摘・提案を処理します。
                </Step>
              </ol>
              <Tip tone="amber">
                信頼度が <span className="font-bold">70% 未満（オレンジ）</span> の案件、黄色い「仕様書との差分」枠がある案件は、いつもより慎重に確認してください。
              </Tip>
            </Card>
          </Section>

          {/* 4 */}
          <Section id="inquiries" title="4. 積算判定アシストの使い方">
            <Card title="一覧画面（/inquiries）">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                <li>上のボタン「すべて／確認待ち／承認済み／修正して回答／相談中」で絞り込めます。ふだんは「確認待ち」にしておくと便利です。</li>
                <li>右上の検索ボックスに案件名・依頼元・受付番号の一部を入れると絞り込めます。</li>
                <li>案件名（青い文字）をクリックすると詳細画面が開きます。</li>
              </ul>
            </Card>
            <Card title="詳細画面（案件をクリックした先）">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><Check size={16} /> これでよい（承認）</p>
                  <p className="mt-2 text-sm text-emerald-900">AI の回答案に問題がないとき。コメントは空でも OK。押すと状態が「承認済み」になります。</p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-sky-800"><PencilLine size={16} /> 修正して回答</p>
                  <p className="mt-2 text-sm text-sky-900">
                    直す必要があるとき。①修正内容を書く、②「弟子に教える判断ルール」に「〜のときは〜とする」の形で書く、③確定。②を書くと AI が学びます。
                  </p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-rose-800"><MessageSquareWarning size={16} /> 現場経験者・協会へ相談</p>
                  <p className="mt-2 text-sm text-rose-900">自分では判断できないとき。相談内容と相談先を書いて確定。状態が「相談中」になり、あとで戻ってこられます。</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p className="font-bold text-slate-900">判断ルールの書き方の例</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>礫径 20mm 超 × φ100 指定 → φ200（BM-R型）を提案</li>
                  <li>粘性土 × 地下水位が管頂より 1.0m 以上高い → 薬液注入を必須扱い、工期 +2日</li>
                </ul>
                <p className="text-xs text-slate-500">「条件 → 判断」の形で書くと、AI が同じ条件のときに同じ判断をできるようになります。</p>
              </div>
              <Tip>
                処理を間違えたら、同じ画面の「確認待ちに戻す」ボタンで元に戻せます。
              </Tip>
            </Card>
          </Section>

          {/* 5 */}
          <Section id="others" title="5. その他の画面の使い方">
            <Card title="資料 品質チェック">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                <li>AI が見つけた「抜け漏れ／外れ値／不整合／改定漏れ」が一覧で出ます。重要度「高」から順に確認します。</li>
                <li>「AI の修正案」を読み、資料を直したら「修正済みにする」を押します（左の丸をクリックしても同じ）。</li>
                <li>「再チェック」を押すと資料全体を AI がもう一度点検します。</li>
              </ul>
            </Card>
            <Card title="標準化・仕様への昇格">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                <li>「現在の仕様書」と「実際の判断」を左右で比べ、下の「AI の昇格提案」を読みます。</li>
                <li>来年度の資料に入れてよければ「採用する」、まだ判断できなければ「保留」、入れないなら「却下」。</li>
                <li>右上の「2027年版 改定案を出力」で、採用したものをまとめて出せます。</li>
              </ul>
              <Tip tone="amber">この画面の判断は来年度の積算資料・仕様書に影響します。迷う場合は「保留」にして、担当者や協会と相談してください。</Tip>
            </Card>
            <Card title="図面直読／Web 一次回答／動画マニュアル生成">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                <li><span className="font-bold">図面直読：</span>図面をドロップ（またはサンプルで試す）→ 読み取り結果を確認 → 「積算判定アシストへ送る」。信頼度がオレンジの項目は目で確認。</li>
                <li><span className="font-bold">Web 一次回答：</span>協会サイトで外部の方が使う画面のイメージです。社内の担当者が操作する画面ではありません。</li>
                <li><span className="font-bold">動画マニュアル生成：</span>「動画をアップロード」→ 生成が終わったらジョブをクリック → 手順書を確認し PDF／Word で出力。</li>
              </ul>
            </Card>
            <Card title="モデル接続・利用上限（管理者向け）">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                <li>AI が止まったときだけ使います。主系が「障害」なら、別のモデルの「主系に切替」を押します。</li>
                <li>月の利用金額と利用者ごとの上限が見えます。上限に近づくとバーが赤くなります。</li>
              </ul>
            </Card>
          </Section>

          {/* 6 */}
          <Section id="glossary" title="6. 用語集">
            <Card>
              <dl className="divide-y divide-slate-100">
                {glossary.map((g) => (
                  <div key={g.term} className="grid grid-cols-1 gap-1 py-3 md:grid-cols-[220px_1fr] md:gap-4">
                    <dt className="text-sm font-bold text-slate-900">{g.term}</dt>
                    <dd className="text-sm text-slate-700">{g.desc}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Section>

          {/* 7 */}
          <Section id="faq" title="7. 困ったときは">
            <Card>
              <div className="space-y-2">
                {faq.map((f) => (
                  <details key={f.q} className="group rounded-lg border border-slate-200">
                    <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-bold text-slate-900">
                      <Chip tone="navy">Q</Chip>
                      {f.q}
                    </summary>
                    <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700">
                      <span className="mr-2 inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">A</span>
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <BookOpen size={16} className="text-navy-600" />
                解決しないときは、積算担当 A またはシステム管理者に連絡してください。案件番号（例：INQ-2026-0912-03）を伝えるとスムーズです。
              </div>
            </Card>
          </Section>
        </div>
      </div>
    </>
  );
}
