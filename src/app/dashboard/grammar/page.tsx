"use client";

/**
 * Грамматика (Фаза 1 P0-ядра): поток сетами по 10 вместо чек-листа «X/80».
 * Каждый ответ немедленно уходит в attempts через POST /api/attempts
 * (append-only, правильность судит сервер); счётчик шапки читает ТЕ ЖЕ
 * attempts + topic_mastery — один источник правды. Сбой сохранения виден
 * студенту честно («не сохранено») с ретраем тем же client_attempt_id.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { GRAMMAR_TASKS } from "@/data/grammar-tasks";
import { canonicalTopic } from "@/data/topic-map";
import { topicById } from "@/lib/ai/topics";
import { shuffleOptions } from "@/lib/shuffle";
import { createClient } from "@/lib/supabase/client";
import type { Level, Question } from "@/data/types";
import { SectionBack } from "@/components/SectionBack";
import { SectionHint } from "@/components/SectionHint";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];
const SET_SIZE = 10;
const WEAK_STRENGTH = 60; // единый порог слабости продукта (ядро/титулы/маршрут)
const ACCURACY_WINDOW_DAYS = 90;

const T = {
  ru: {
    title: "Грамматика турецкого",
    accuracy: "Точность", answered: "отвечено", weak: "слабых тем", noData: "—",
    accuracyHint: "по ответам за 90 дней",
    allLevels: "Все уровни", start: "Начать сет", startHint: (n: number) => `${n} вопросов подряд, с объяснениями`,
    q: "Вопрос", of: "из", explanation: "Объяснение",
    correct: "Правильно!", wrong: "Ошибка",
    next: "Дальше", finishSet: "Завершить сет",
    saved: "сохранено", saving: "сохраняем…", saveFailed: "не сохранено", retry: "повторить",
    sumTitle: "Сет завершён", sumLine: (c: number, t: number) => `${c} из ${t} верно`,
    sumWeak: "Стоит повторить", sumAllSaved: "Все ответы сохранены",
    sumUnsaved: (n: number) => `${n} отв. не сохранилось`, retryAll: "Сохранить ещё раз",
    again: "Ещё сет", done: "Завершить",
    empty: "Нет вопросов по выбранному уровню.",
  },
  en: {
    title: "Turkish grammar",
    accuracy: "Accuracy", answered: "answered", weak: "weak topics", noData: "—",
    accuracyHint: "answers over 90 days",
    allLevels: "All levels", start: "Start a set", startHint: (n: number) => `${n} questions in a row, with explanations`,
    q: "Question", of: "of", explanation: "Explanation",
    correct: "Correct!", wrong: "Wrong",
    next: "Next", finishSet: "Finish set",
    saved: "saved", saving: "saving…", saveFailed: "not saved", retry: "retry",
    sumTitle: "Set finished", sumLine: (c: number, t: number) => `${c} of ${t} correct`,
    sumWeak: "Worth reviewing", sumAllSaved: "All answers saved",
    sumUnsaved: (n: number) => `${n} answers not saved`, retryAll: "Save again",
    again: "Another set", done: "Finish",
    empty: "No questions for the selected level.",
  },
  tr: {
    title: "Türkçe dil bilgisi",
    accuracy: "Doğruluk", answered: "cevaplandı", weak: "zayıf konu", noData: "—",
    accuracyHint: "son 90 günün cevapları",
    allLevels: "Tüm seviyeler", start: "Sete başla", startHint: (n: number) => `arka arkaya ${n} soru, açıklamalı`,
    q: "Soru", of: "/", explanation: "Açıklama",
    correct: "Doğru!", wrong: "Yanlış",
    next: "Sonraki", finishSet: "Seti bitir",
    saved: "kaydedildi", saving: "kaydediliyor…", saveFailed: "kaydedilmedi", retry: "tekrar dene",
    sumTitle: "Set bitti", sumLine: (c: number, t: number) => `${t} sorudan ${c} doğru`,
    sumWeak: "Tekrar etmeye değer", sumAllSaved: "Tüm cevaplar kaydedildi",
    sumUnsaved: (n: number) => `${n} cevap kaydedilmedi`, retryAll: "Yeniden kaydet",
    again: "Yeni set", done: "Bitir",
    empty: "Seçilen seviyeye uygun soru yok.",
  },
  kk: {
    title: "Түрік грамматикасы",
    accuracy: "Дәлдік", answered: "жауап берілді", weak: "әлсіз тақырып", noData: "—",
    accuracyHint: "90 күндегі жауаптар бойынша",
    allLevels: "Барлық деңгей", start: "Сетті бастау", startHint: (n: number) => `қатарынан ${n} сұрақ, түсіндірмелерімен`,
    q: "Сұрақ", of: "/", explanation: "Түсіндірме",
    correct: "Дұрыс!", wrong: "Қате",
    next: "Келесі", finishSet: "Сетті аяқтау",
    saved: "сақталды", saving: "сақталуда…", saveFailed: "сақталмады", retry: "қайталау",
    sumTitle: "Сет аяқталды", sumLine: (c: number, t: number) => `${t} сұрақтың ${c}-і дұрыс`,
    sumWeak: "Қайталаған жөн", sumAllSaved: "Барлық жауап сақталды",
    sumUnsaved: (n: number) => `${n} жауап сақталмады`, retryAll: "Қайта сақтау",
    again: "Тағы бір сет", done: "Аяқтау",
    empty: "Таңдалған деңгейге сай сұрақ жоқ.",
  },
};

type Phase = "home" | "set" | "summary";
type SaveStatus = "saving" | "saved" | "failed";

type SetItem = {
  q: Question;
  options: string[];
  answerIdx: number; // правильный индекс в перетасованных опциях
  selected: number | null;
  clientAttemptId: string;
  shownAt: number;
  timeSpentMs: number | null; // фиксируется в момент клика (ретрай не пересчитывает)
  save: SaveStatus | null;
};

type Stats = {
  available: boolean; // false = таблицы ещё нет / select упал
  answered: number; // всего попыток за всю историю
  accuracy: number | null; // 0..100 за 90 дней; null = нечего оценивать
  weakTopics: number;
  answeredIds: Set<string>;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GrammarPage() {
  const { locale } = useI18n();
  const c = pick(locale, T);

  const [level, setLevel] = useState<Level | "all">("all");
  const [phase, setPhase] = useState<Phase>("home");
  const [items, setItems] = useState<SetItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStats({ available: false, answered: 0, accuracy: null, weakTopics: 0, answeredIds: new Set() });
        return;
      }
      const since = new Date(Date.now() - ACCURACY_WINDOW_DAYS * 86_400_000).toISOString();
      const [attemptsRes, weakRes] = await Promise.all([
        supabase
          .from("attempts")
          .select("question_id, is_correct, answered_at")
          .eq("user_id", user.id)
          .eq("skill", "grammar")
          .eq("is_self_reported", false)
          .order("answered_at", { ascending: false })
          .limit(5000),
        supabase
          .from("topic_mastery")
          .select("topic, strength")
          .eq("user_id", user.id)
          .lt("strength", WEAK_STRENGTH)
          .neq("topic", "other"),
      ]);
      if (attemptsRes.error) {
        setStats({ available: false, answered: 0, accuracy: null, weakTopics: 0, answeredIds: new Set() });
        return;
      }
      const rows = attemptsRes.data ?? [];
      const inWindow = rows.filter((r) => (r.answered_at as string) >= since);
      const correct = inWindow.filter((r) => r.is_correct).length;
      setStats({
        available: true,
        answered: rows.length,
        accuracy: inWindow.length > 0 ? Math.round((100 * correct) / inWindow.length) : null,
        weakTopics: (weakRes.data ?? []).length,
        answeredIds: new Set(rows.map((r) => r.question_id as string)),
      });
    } catch {
      setStats({ available: false, answered: 0, accuracy: null, weakTopics: 0, answeredIds: new Set() });
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const pool = useMemo(
    () => GRAMMAR_TASKS.filter((q) => level === "all" || q.level === level),
    [level],
  );

  function startSet() {
    const answered = stats?.answeredIds ?? new Set<string>();
    // свежие вопросы первыми, уже виденные — следом (взвешенный подбор — Фаза 4)
    const fresh = shuffle(pool.filter((q) => !answered.has(q.id)));
    const seen = shuffle(pool.filter((q) => answered.has(q.id)));
    const picked = [...fresh, ...seen].slice(0, SET_SIZE);
    setItems(
      picked.map((q) => {
        const s = shuffleOptions(q.options, q.correctAnswer);
        return {
          q,
          options: s.shuffled,
          answerIdx: s.newCorrectIndex,
          selected: null,
          clientAttemptId: crypto.randomUUID(),
          shownAt: Date.now(),
          timeSpentMs: null,
          save: null,
        };
      }),
    );
    setCurrent(0);
    setPhase("set");
  }

  async function persist(item: SetItem, selectedOriginal: number) {
    setItems((prev) =>
      prev.map((it) => (it.clientAttemptId === item.clientAttemptId ? { ...it, save: "saving" } : it)),
    );
    let ok = false;
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: item.q.id,
          selected: selectedOriginal,
          timeSpentMs: item.timeSpentMs,
          clientAttemptId: item.clientAttemptId,
          source: "free_practice",
        }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    setItems((prev) =>
      prev.map((it) =>
        it.clientAttemptId === item.clientAttemptId ? { ...it, save: ok ? "saved" : "failed" } : it,
      ),
    );
  }

  function answer(idx: number) {
    const item = items[current];
    if (!item || item.selected !== null) return;
    // вызывается только из onClick — рендер Date.now() не видит
    // eslint-disable-next-line react-hooks/purity
    const spent = Date.now() - item.shownAt;
    const updated = { ...item, selected: idx, timeSpentMs: spent };
    setItems((prev) => prev.map((it, i) => (i === current ? updated : it)));
    // перетасованный индекс → оригинальный: сервер судит по банку вопросов
    const selectedOriginal = item.q.options.indexOf(item.options[idx]);
    void persist(updated, selectedOriginal);
  }

  function finishSet() {
    setPhase("summary");
    void loadStats();
  }

  async function retryFailed() {
    const failed = items.filter((it) => it.save === "failed" && it.selected !== null);
    for (const it of failed) {
      const selectedOriginal = it.q.options.indexOf(it.options[it.selected!]);
      await persist(it, selectedOriginal);
    }
    void loadStats();
  }

  /* ------------------------------- шапка -------------------------------- */

  const header = (
    <div>
      <SectionBack />
      <SectionHint id="grammar" />
      <h2 className="text-xl font-bold tracking-tight">{c.title}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)]">
        <span>
          {c.accuracy}:{" "}
          <span className="font-semibold text-[var(--color-brand)]">
            {stats?.accuracy != null ? `${stats.accuracy}%` : c.noData}
          </span>
        </span>
        <span>
          {c.answered}: <span className="font-semibold text-[var(--color-foreground)]">{stats?.answered ?? c.noData}</span>
        </span>
        <span>
          {c.weak}: <span className="font-semibold text-[#d97706]">{stats ? stats.weakTopics : c.noData}</span>
        </span>
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--color-muted)]">{c.accuracyHint}</div>
    </div>
  );

  /* ------------------------------ стартовый ------------------------------ */

  if (phase === "home") {
    return (
      <div>
        {header}
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterBtn active={level === "all"} onClick={() => setLevel("all")}>{c.allLevels}</FilterBtn>
          {LEVELS.map((l) => (
            <FilterBtn key={l} active={level === l} onClick={() => setLevel(l)}>{l}</FilterBtn>
          ))}
        </div>
        <div className="glass mt-5 rounded-3xl p-6">
          {pool.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">{c.empty}</p>
          ) : (
            <>
              <button type="button" onClick={startSet} className="btn-primary rounded-full px-6 py-3 text-sm font-semibold">
                {c.start} →
              </button>
              <p className="mt-2 text-xs text-[var(--color-muted)]">{c.startHint(Math.min(SET_SIZE, pool.length))}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  /* -------------------------------- итог --------------------------------- */

  if (phase === "summary") {
    const answeredItems = items.filter((it) => it.selected !== null);
    const correctCount = answeredItems.filter((it) => it.selected === it.answerIdx).length;
    const failedCount = answeredItems.filter((it) => it.save === "failed").length;
    // темы ошибок сета: канонический label на языке юзера, иначе строка банка
    const missedTopics = [
      ...new Set(
        answeredItems
          .filter((it) => it.selected !== it.answerIdx)
          .map((it) => {
            const id = canonicalTopic(it.q.topic);
            return id ? (topicById(id)?.label[locale] ?? it.q.topic) : it.q.topic;
          }),
      ),
    ];
    return (
      <div>
        {header}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mt-5 rounded-3xl p-6">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">{c.sumTitle}</h3>
          <p className="mt-1 text-2xl font-bold text-[var(--color-brand)]">
            {c.sumLine(correctCount, answeredItems.length)}
          </p>
          {missedTopics.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#d97706]">{c.sumWeak}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missedTopics.map((t) => (
                  <span key={t} className="rounded-full bg-[#d97706]/10 px-2.5 py-1 text-xs font-medium text-[#92400e]">{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 text-xs">
            {failedCount > 0 ? (
              <span className="text-[#dc2626]">
                ⚠️ {c.sumUnsaved(failedCount)}{" "}
                <button type="button" onClick={() => void retryFailed()} className="font-semibold underline underline-offset-2">
                  {c.retryAll}
                </button>
              </span>
            ) : (
              answeredItems.length > 0 && <span className="text-[#16a34a]">✓ {c.sumAllSaved}</span>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={startSet} className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium">
              {c.again}
            </button>
            <button
              type="button"
              onClick={() => setPhase("home")}
              className="rounded-full bg-black/[0.05] px-5 py-2.5 text-sm font-medium text-[var(--color-muted)] hover:bg-black/[0.08]"
            >
              {c.done}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* --------------------------------- сет --------------------------------- */

  const item = items[current];
  if (!item) return null; // недостижимо: сет стартует только при непустом пуле
  const answered = item.selected !== null;
  const isLast = current === items.length - 1;

  return (
    <div>
      {header}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-muted)]">
          {c.q} {current + 1} {c.of} {items.length}
        </span>
        <button
          type="button"
          onClick={finishSet}
          className="text-xs text-[var(--color-muted)] underline-offset-2 hover:underline"
        >
          {c.finishSet}
        </button>
      </div>

      <motion.div
        key={item.q.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        className="mt-3 overflow-hidden rounded-2xl border border-black/[0.07] bg-white/60 px-5 py-4"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[var(--color-muted)]">{item.q.topic}</span>
          <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand-2)]">
            {item.q.level}
          </span>
        </div>
        <div className="mt-2 text-sm font-medium text-[var(--color-foreground)]">{item.q.question}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.options.map((opt, oi) => {
            let cls = "border-black/[0.1] bg-black/[0.02] text-[var(--color-foreground)] hover:border-black/[0.18]";
            if (answered && oi === item.answerIdx) cls = "border-[#16a34a] bg-[#16a34a]/[0.08]";
            else if (answered && oi === item.selected) cls = "border-[#dc2626] bg-[#dc2626]/[0.06]";
            return (
              <button
                key={oi}
                type="button"
                disabled={answered}
                onClick={() => answer(oi)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all disabled:cursor-default ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {answered && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
              <div className="mt-3 text-sm font-medium">
                {item.selected === item.answerIdx ? (
                  <span className="text-[#16a34a]">✅ {c.correct}</span>
                ) : (
                  <span className="text-[#dc2626]">❌ {c.wrong}</span>
                )}
              </div>
              <div className="mt-2 rounded-xl bg-[var(--color-brand)]/[0.05] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-brand)]">{c.explanation}</div>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-foreground)]">{item.q.explanation}</p>
              </div>
              {/* честный статус сохранения — правило 1.3: несохранённое не «есть» */}
              <div className="mt-2 text-[11px]">
                {item.save === "saved" && <span className="text-[#16a34a]">✓ {c.saved}</span>}
                {item.save === "saving" && <span className="text-[var(--color-muted)]">{c.saving}</span>}
                {item.save === "failed" && (
                  <span className="text-[#dc2626]">
                    ⚠️ {c.saveFailed}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        const orig = item.q.options.indexOf(item.options[item.selected!]);
                        void persist(item, orig);
                      }}
                      className="font-semibold underline underline-offset-2"
                    >
                      {c.retry}
                    </button>
                  </span>
                )}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isLast) return finishSet();
                    // time_spent следующего вопроса стартует с его показа
                    setItems((prev) => prev.map((it, i) => (i === current + 1 ? { ...it, shownAt: Date.now() } : it)));
                    setCurrent((i) => i + 1);
                  }}
                  className="btn-primary rounded-full px-5 py-2 text-sm font-medium"
                >
                  {isLast ? c.finishSet : `${c.next} →`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${active ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
    >
      {children}
    </button>
  );
}
