"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { inquiries as seed } from "./mock-data";
import type { Inquiry, NewInquiryInput } from "./types";
import { buildInquiry } from "./mock-ai";

interface ReviewInput {
  note: string;
  learnedDelta?: string;
}

interface InquiryStore {
  inquiries: Inquiry[];
  approve: (id: string, input: ReviewInput) => void;
  revise: (id: string, input: ReviewInput) => void;
  escalate: (id: string, input: ReviewInput) => void;
  reopen: (id: string) => void;
  addInquiry: (input: NewInquiryInput) => Inquiry;
}

const Ctx = createContext<InquiryStore | null>(null);

const REVIEWER = "積算担当 A";

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(seed);

  const update = useCallback(
    (id: string, patch: Partial<Inquiry>) =>
      setInquiries((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q))),
    [],
  );

  const value = useMemo<InquiryStore>(
    () => ({
      inquiries,
      approve: (id, { note }) =>
        update(id, { status: "approved", reviewer: REVIEWER, reviewerNote: note || "AI回答案どおりでOK。" }),
      revise: (id, { note, learnedDelta }) =>
        update(id, { status: "revised", reviewer: REVIEWER, reviewerNote: note, learnedDelta }),
      escalate: (id, { note }) =>
        update(id, { status: "escalated", reviewer: REVIEWER, reviewerNote: note }),
      reopen: (id) =>
        update(id, { status: "pending_review", reviewer: undefined, reviewerNote: undefined, learnedDelta: undefined }),
      addInquiry: (input) => {
        const created = buildInquiry(input, inquiries);
        setInquiries((prev) => [created, ...prev]);
        return created;
      },
    }),
    [inquiries, update],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInquiries() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInquiries must be used within InquiryProvider");
  return ctx;
}
