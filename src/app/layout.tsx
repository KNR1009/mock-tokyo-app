import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { InquiryProvider } from "@/lib/inquiry-store";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "積算 AI アシスト｜東京油機工業（モック）",
  description: "AIの弟子入り：積算判定アシスト・資料品質チェック・標準化提案のモックアプリ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="antialiased">
        <InquiryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
            </main>
          </div>
        </InquiryProvider>
      </body>
    </html>
  );
}
