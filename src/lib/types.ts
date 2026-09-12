export type InquiryStatus =
  | "pending_review" // AI回答案あり・担当者確認待ち
  | "approved" // 担当者承認済み
  | "revised" // 担当者が修正して回答
  | "escalated" // 現場経験者・協会内へ相談中
  | "draft"; // AI回答案 生成中

export type Fit = "◎" | "○" | "△" | "×";

export type SourceType = "PDF図面" | "手書き図面" | "Excel" | "電話";

export interface Reference {
  doc: string;
  page: string;
  label: string;
}

export interface AiProposal {
  machine: string;
  fit: Fit;
  confidence: number; // 0-100
  estimate: number; // 円
  dailyAdvance: number; // m/日
  durationDays: number;
  rationale: string[];
  cautions: string[];
  references: Reference[];
  deviationFromSpec?: string; // 仕様書との差分（経験値）
}

export interface Inquiry {
  id: string;
  receivedAt: string; // ISO
  client: string;
  clientType: "自治体" | "設計事務所" | "協会加盟工事会社";
  title: string;
  workType: string;
  pipeDiameter: number; // mm
  length: number; // m
  soil: string;
  nValue: string;
  groundwater: string;
  shaft: string;
  source: SourceType;
  status: InquiryStatus;
  proposal: AiProposal;
  reviewerNote?: string;
  reviewer?: string;
  learnedDelta?: string; // 学習キューに入った差分
}

export interface KnowledgeCandidate {
  id: string;
  pattern: string;
  currentSpec: string;
  observedPractice: string;
  occurrences: number;
  period: string;
  suggestion: string;
  targetDoc: string;
  status: "提案中" | "採用予定" | "保留" | "却下";
  evidence: string[];
}

export type IssueType = "抜け漏れ" | "外れ値" | "不整合" | "改定漏れ";
export type Severity = "高" | "中" | "低";

export interface QualityIssue {
  id: string;
  type: IssueType;
  severity: Severity;
  doc: string;
  location: string;
  description: string;
  suggestion: string;
  resolved: boolean;
}

export interface ModelProvider {
  id: string;
  name: string;
  vendor: string;
  role: "主系" | "副系" | "緊急予備（ローカル）";
  status: "稼働中" | "待機" | "障害";
  latencyMs: number;
  monthlyCost: number;
  note: string;
}

export interface ManualJob {
  id: string;
  title: string;
  videoLength: string;
  uploadedAt: string;
  progress: number; // 0-100
  status: "生成済み" | "生成中" | "未着手";
  steps?: { no: number; title: string; body: string; timestamp: string }[];
}

// ---- 参照データ（AI が回答案を作るときに照らし合わせるナレッジ） ----
export type SourceCategory =
  | "積算資料"
  | "参考資料（仕様書）"
  | "判断履歴"
  | "施工実績"
  | "機種カタログ"
  | "土質・地盤データ";

export type SourceStatus = "取込済み" | "取込中" | "要確認" | "除外";

export interface KnowledgeSource {
  id: string;
  category: SourceCategory;
  name: string;
  fileType: "PDF" | "Excel" | "CSV" | "CAD" | "画像";
  size: string;
  version?: string;
  validFrom?: string; // YYYY-MM-DD
  validTo?: string; // YYYY-MM-DD
  volume: string; // "48ページ" / "412件"
  status: SourceStatus;
  updatedAt: string; // YYYY-MM-DD
  usedFor: string;
  note?: string;
}

// ---- 新規案件の入力資料 ----
export type UploadKind = "設計図面" | "柱状図（地質調査）" | "条件表（Excel）" | "電話メモ";

export interface UploadedFile {
  id: string;
  kind: UploadKind;
  name: string;
  size: string;
  readStatus: "読み取り中" | "読み取り完了" | "要確認";
  note?: string;
}

export interface NewInquiryInput {
  client: string;
  clientType: Inquiry["clientType"];
  workType: string;
  pipeDiameter: number;
  length: number;
  soil: string;
  nValue: string;
  groundwater: string;
  shaft: string;
  source: SourceType;
  memo?: string;
}
