export const yen = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(n);

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(iso));

export const statusLabel: Record<string, string> = {
  pending_review: "確認待ち",
  approved: "承認済み",
  revised: "修正して回答",
  escalated: "相談中",
  draft: "AI生成中",
};
