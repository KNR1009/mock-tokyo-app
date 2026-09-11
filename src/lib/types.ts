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
