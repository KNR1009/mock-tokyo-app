"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ClipboardCheck,
  BookOpenCheck,
  ScanSearch,
  Globe,
  Video,
  Settings,
  Bot,
} from "lucide-react";
import { useInquiries } from "@/lib/inquiry-store";

const nav = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard, phase: "" },
  { href: "/inquiries", label: "積算判定アシスト", icon: Inbox, phase: "第1", badge: true },
  { href: "/quality", label: "資料 品質チェック", icon: ClipboardCheck, phase: "第1" },
  { href: "/knowledge", label: "標準化・仕様への昇格", icon: BookOpenCheck, phase: "第1-2" },
  { href: "/drawings", label: "図面直読", icon: ScanSearch, phase: "第2" },
  { href: "/web-answer", label: "Web 一次回答", icon: Globe, phase: "第3" },
  { href: "/manuals", label: "動画マニュアル生成", icon: Video, phase: "第0" },
  { href: "/settings", label: "モデル接続・利用上限", icon: Settings, phase: "" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { inquiries } = useInquiries();
  const pending = inquiries.filter((q) => q.status === "pending_review").length;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700 text-white">
          <Bot size={20} />
        </span>
        <div>
          <p className="text-sm font-bold leading-tight text-slate-900">積算 AI アシスト</p>
          <p className="text-[11px] text-slate-500">東京油機工業 ／ ベビーモール協会</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon, phase, badge }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-navy-50 font-semibold text-navy-800" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} className={active ? "text-navy-700" : "text-slate-400"} />
                  <span className="flex-1">{label}</span>
                  {badge && pending > 0 && (
                    <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">{pending}</span>
                  )}
                  {phase && !badge && <span className="text-[10px] text-slate-400">{phase}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">A</span>
          <div className="text-xs">
            <p className="font-semibold text-slate-800">積算担当 A</p>
            <p className="text-slate-500">師匠（レビュアー）</p>
          </div>
        </div>
        <p className="mt-3 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] leading-relaxed text-slate-500">
          ※ モックアプリ：機種・数値・自治体名はすべて架空です
        </p>
      </div>
    </aside>
  );
}
