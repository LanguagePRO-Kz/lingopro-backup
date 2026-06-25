"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_EXAM, EXAMS, type Exam, type ExamId } from "./exams";
import { ComingSoonModal } from "@/components/ComingSoonModal";

const STORAGE_KEY = "lingopro:exam";

type ExamContextValue = {
  examId: ExamId;
  exam: Exam;
  /** Select an exam: switches context if active, otherwise opens the waitlist modal. */
  selectExam: (id: ExamId) => void;
  /** Open the "coming soon" waitlist modal for a specific exam. */
  openWaitlist: (id: ExamId) => void;
};

const ExamContext = createContext<ExamContextValue | null>(null);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [examId, setExamId] = useState<ExamId>(DEFAULT_EXAM);
  const [waitlistId, setWaitlistId] = useState<ExamId | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ExamId | null;
    if (stored && EXAMS[stored] && EXAMS[stored].status === "active") {
      setExamId(stored);
    }
  }, []);

  const openWaitlist = useCallback((id: ExamId) => setWaitlistId(id), []);

  const selectExam = useCallback((id: ExamId) => {
    const target = EXAMS[id];
    if (!target) return;
    if (target.status === "active") {
      setExamId(id);
      window.localStorage.setItem(STORAGE_KEY, id);
    } else {
      setWaitlistId(id);
    }
  }, []);

  const value = useMemo<ExamContextValue>(
    () => ({ examId, exam: EXAMS[examId], selectExam, openWaitlist }),
    [examId, selectExam, openWaitlist],
  );

  return (
    <ExamContext.Provider value={value}>
      {children}
      <ComingSoonModal
        exam={waitlistId ? EXAMS[waitlistId] : null}
        onClose={() => setWaitlistId(null)}
      />
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be used within ExamProvider");
  return ctx;
}
