import type { AiProposal, Fit, Inquiry, NewInquiryInput } from "./types";

// ※ モック用の簡易ロジック。実際は積算資料・仕様書・判断履歴を参照する AI が生成する。

const MAX_GRAVEL_RE = /礫径\s*(\d+)\s*mm/;

function pickMachine(d: number, soil: string) {
  const gravel = soil.match(MAX_GRAVEL_RE);
  const gravelMm = gravel ? Number(gravel[1]) : soil.includes("礫") ? 30 : 0;
  if (gravelMm > 20) return { machine: "BM-R型 礫対応削進機", code: "BM-R", gravelMm };
  if (d <= 150) return { machine: "BM-S型 小口径削進機", code: "BM-S", gravelMm };
  if (d <= 250) return { machine: "BM-M型 小口径削進機", code: "BM-M", gravelMm };
  return { machine: "BM-L型 中口径削進機", code: "BM-L", gravelMm };
}

const UNIT: Record<string, { perM: number; base: number; advance: number }> = {
  "BM-S": { perM: 78_000, base: 560_000, advance: 8 },
  "BM-M": { perM: 92_000, base: 640_000, advance: 8 },
  "BM-L": { perM: 118_000, base: 900_000, advance: 8 },
  "BM-R": { perM: 110_000, base: 780_000, advance: 5 },
};

export function generateProposal(input: NewInquiryInput): AiProposal {
  const { machine, code, gravelMm } = pickMachine(input.pipeDiameter, input.soil);
  const u = UNIT[code];
  const soft = /粘性|シルト|軟弱/.test(input.soil);
  const highWater = /GL-([0-9.]+)/.test(input.groundwater) && Number(input.groundwater.match(/GL-([0-9.]+)/)![1]) < 2.5;
  const overLength = input.length > 60;
  const handwritten = input.source === "手書き図面";
  const unknownSoil = /不明|未実施|—/.test(input.soil);

  let advance = u.advance;
  if (soft) advance = Math.max(3, advance - 2);
  const durationDays = Math.ceil(input.length / advance) + (soft && highWater ? 2 : 0);

  let fit: Fit = "◎";
  let confidence = 92;
  const rationale: string[] = [];
  const cautions: string[] = [];
  const references = [
    { doc: "積算資料 2026年版", page: "p.12 表3-2", label: "土質区分と日進量" },
    { doc: "積算資料 2026年版", page: "p.18 表5-1", label: "機種別 標準歩掛" },
  ];
  let deviationFromSpec: string | undefined;

  rationale.push(`管径 φ${input.pipeDiameter}・延長 ${input.length}m に対し、${machine} の適用範囲で判定`);

  if (gravelMm > 20) {
    fit = "△";
    confidence -= 16;
    rationale.push(`最大礫径 ${gravelMm}mm は BM-S/BM-M型 の上限（20mm）を超えるため礫対応機を選定`);
    references.push({ doc: "判断履歴", page: "2023-2026", label: "礫混じり地盤 案件 14件" });
    if (input.pipeDiameter <= 150) {
      deviationFromSpec = `仕様書では φ${input.pipeDiameter} 適用可だが、経験則上 礫径 ${gravelMm}mm では φ200（BM-R型）を推奨。`;
      cautions.push("客先指定径からの変更提案となるため、設計者への説明資料が必要");
    }
  }
  if (soft) {
    if (fit === "◎") fit = "○";
    confidence -= 6;
    rationale.push(`軟弱な粘性土のため日進量を標準 ${u.advance}m/日 から ${advance}m/日 に低減`);
    references.push({ doc: "積算資料 2026年版", page: "p.14 表3-4", label: "軟弱土 日進量補正" });
  }
  if (highWater) {
    if (fit === "◎") fit = "○";
    confidence -= 4;
    cautions.push(
      soft
        ? "粘性土 × 地下水位が高いため、補助工法（薬液注入）を必須扱いとし工期 +2日（学習済みルール）"
        : "地下水位が管底より高い可能性があるため、補助工法の要否を設計者へ確認",
    );
  }
  if (overLength) {
    if (fit === "◎") fit = "○";
    confidence -= 6;
    cautions.push("延長 60m 超のため、推力計算と中間ジャッキ要否を積算担当が確認");
    references.push({ doc: "参考資料（仕様書）", page: "p.9", label: "最大推進延長" });
  }
  if (handwritten) {
    confidence -= 8;
    cautions.push("手書き図面のため、管底高・立坑位置の読み取り精度に注意（要目視確認）");
  }
  if (unknownSoil) {
    fit = "○";
    confidence = Math.min(confidence, 62);
    rationale.push("土質データ未取得のため、標準土質（砂質土 区分B）を仮定した暫定判定");
    cautions.push("土質調査結果の提出を依頼し、確定判定は再度実施");
  }
  if (rationale.length === 1) rationale.push("標準的な適用条件のため、積算資料の標準歩掛をそのまま適用");

  const estimate = Math.round((u.base + u.perM * input.length + (soft && highWater ? 420_000 : 0)) / 10_000) * 10_000;

  return {
    machine: deviationFromSpec ? `${machine}（φ200 へ変更提案）` : machine,
    fit,
    confidence: Math.max(50, confidence),
    estimate,
    dailyAdvance: advance,
    durationDays,
    rationale,
    cautions,
    references,
    deviationFromSpec,
  };
}

export function buildInquiry(input: NewInquiryInput, existing: Inquiry[]): Inquiry {
  const now = new Date();
  const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const seq = existing.filter((q) => q.id.startsWith(`INQ-${ymd}`)).length + 1;
  const id = `INQ-${ymd}-${String(seq).padStart(2, "0")}`;
  const kind = input.workType.includes("取付") ? "取付管" : input.workType.includes("事前") ? "事前相談" : "本管新設";
  const title = `${kind} φ${input.pipeDiameter} 推進延長 ${input.length}m（${input.soil.split("（")[0]}）`;
  return {
    id,
    receivedAt: now.toISOString(),
    client: input.client,
    clientType: input.clientType,
    title,
    workType: input.workType,
    pipeDiameter: input.pipeDiameter,
    length: input.length,
    soil: input.soil,
    nValue: input.nValue,
    groundwater: input.groundwater,
    shaft: input.shaft,
    source: input.source,
    status: "pending_review",
    proposal: generateProposal(input),
  };
}
