"use client";

import { useEffect, useMemo, useState } from "react";
import { useExam } from "@/lib/exam-context";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { loadPlan, type PackageId } from "@/lib/billing";
import { contentLevel } from "@/lib/daily-plan";
import { planBadge } from "@/lib/dashboard";
import { assessFeasibility } from "@/lib/plan/feasibility";
import { topicsForSpan } from "@/lib/plan/route";
import { fetchProfileLocation, saveProfileLocation } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";
import { daysToExam, fetchExamPlan, saveExamPlanToProfile, saveStudyMinutes, type ExamDateMode } from "@/lib/exam-plan";

const T = {
  ru: {
    profile: "Профиль", name: "Имя", email: "Email", avatar: "Аватар", upload: "Загрузить", save: "Сохранить", saved: "Сохранено ✓",
    city: "Город", country: "Страна", cityPh: "Например, Алматы", countryPh: "Например, Казахстан",
    exam: "Экзамен", chosenExam: "Выбранный экзамен", target: "Целевой уровень", examDate: "Дата экзамена",
    pace: "Минут в день", paceNote: "Дневной план пересоберётся под новый темп при следующем открытии дашборда.",
    fUnknown: (m: number, d: number, tgt: string) => `При ${m} мин/день на все темы до ${tgt} нужно ~${d} дней занятий.`,
    fOk: (need: number, left: number) => `Успеваешь: ~${need} дней работы при ${left} днях до экзамена.`,
    fTight: (need: number, left: number) => `Впритык: ~${need} дней работы при ${left} до экзамена — без пропусков.`,
    fNotEnough: (m: number, mn: number, dt: string) => `Честно: при ${m} мин/день к дате экзамена не успеть. Варианты: ${mn} мин/день, дата не раньше ${dt} или цель B2 вместо C1.`,
    dateExact: "Точная дата", dateApprox: "Примерно", dateUnknown: "Не знаю", months: "мес", examSaved: "Сохранено ✓", saveExam: "Сохранить",
    sub: "Подписка", currentPlan: "Текущий план", validUntil: "Действует до", manage: "Управлять подпиской",
    notif: "Уведомления", emailNotif: "Email уведомления", reminders: "Напоминания о занятиях", remindTime: "Время напоминания",
    lang: "Язык интерфейса", delete: "Удалить аккаунт",
  },
  en: {
    profile: "Profile", name: "Name", email: "Email", avatar: "Avatar", upload: "Upload", save: "Save", saved: "Saved ✓",
    city: "City", country: "Country", cityPh: "e.g. Almaty", countryPh: "e.g. Kazakhstan",
    exam: "Exam", chosenExam: "Selected exam", target: "Target level", examDate: "Exam date",
    pace: "Minutes per day", paceNote: "Your daily plan rebuilds to the new pace the next time you open the dashboard.",
    fUnknown: (m: number, d: number, tgt: string) => `At ${m} min/day, covering everything up to ${tgt} takes ~${d} study days.`,
    fOk: (need: number, left: number) => `On track: ~${need} days of work with ${left} days until the exam.`,
    fTight: (need: number, left: number) => `Tight: ~${need} days of work with ${left} until the exam — no skipped days.`,
    fNotEnough: (m: number, mn: number, dt: string) => `Honestly: at ${m} min/day you won't make the exam date. Options: ${mn} min/day, a date after ${dt}, or target B2 instead of C1.`,
    dateExact: "Exact date", dateApprox: "Approx.", dateUnknown: "Not sure", months: "mo", examSaved: "Saved ✓", saveExam: "Save",
    sub: "Subscription", currentPlan: "Current plan", validUntil: "Valid until", manage: "Manage subscription",
    notif: "Notifications", emailNotif: "Email notifications", reminders: "Lesson reminders", remindTime: "Reminder time",
    lang: "Interface language", delete: "Delete account",
  },
  tr: {
    profile: "Profil", name: "Ad", email: "E-posta", avatar: "Avatar", upload: "Yükle", save: "Kaydet", saved: "Kaydedildi ✓",
    city: "Şehir", country: "Ülke", cityPh: "örn. Almatı", countryPh: "örn. Kazakistan",
    exam: "Sınav", chosenExam: "Seçilen sınav", target: "Hedef seviye", examDate: "Sınav tarihi",
    pace: "Günde dakika", paceNote: "Günlük plan, panoyu bir sonraki açışında yeni tempoya göre yeniden kurulur.",
    fUnknown: (m: number, d: number, tgt: string) => `Günde ${m} dk ile ${tgt} seviyesine kadar tüm konular ~${d} çalışma günü sürer.`,
    fOk: (need: number, left: number) => `Yetişiyorsun: sınava ${left} gün varken ~${need} günlük iş.`,
    fTight: (need: number, left: number) => `Sıkışık: sınava ${left} gün varken ~${need} günlük iş — hiç gün kaçırmadan.`,
    fNotEnough: (m: number, mn: number, dt: string) => `Dürüstçe: günde ${m} dk ile sınav tarihine yetişmez. Seçenekler: günde ${mn} dk, ${dt} sonrası bir tarih ya da C1 yerine B2.`,
    dateExact: "Kesin tarih", dateApprox: "Yaklaşık", dateUnknown: "Bilmiyorum", months: "ay", examSaved: "Kaydedildi ✓", saveExam: "Kaydet",
    sub: "Abonelik", currentPlan: "Mevcut plan", validUntil: "Geçerlilik", manage: "Aboneliği yönet",
    notif: "Bildirimler", emailNotif: "E-posta bildirimleri", reminders: "Ders hatırlatmaları", remindTime: "Hatırlatma saati",
    lang: "Arayüz dili", delete: "Hesabı sil",
  },
  kk: {
    profile: "Профиль", name: "Аты", email: "Email", avatar: "Аватар", upload: "Жүктеу", save: "Сақтау", saved: "Сақталды ✓",
    city: "Қала", country: "Ел", cityPh: "мыс. Алматы", countryPh: "мыс. Қазақстан",
    exam: "Емтихан", chosenExam: "Таңдалған емтихан", target: "Мақсатты деңгей", examDate: "Емтихан күні",
    pace: "Күніне минут", paceNote: "Күнделікті жоспар келесі жолы дашбордты ашқанда жаңа қарқынға сай қайта құрылады.",
    fUnknown: (m: number, d: number, tgt: string) => `Күніне ${m} минутпен ${tgt} деңгейіне дейінгі барлық тақырыпқа ~${d} оқу күні керек.`,
    fOk: (need: number, left: number) => `Үлгересің: емтиханға ${left} күн қалғанда ~${need} күндік жұмыс.`,
    fTight: (need: number, left: number) => `Тығыз: емтиханға ${left} күн қалғанда ~${need} күндік жұмыс — бір күн де жібермей.`,
    fNotEnough: (m: number, mn: number, dt: string) => `Шынын айтқанда: күніне ${m} минутпен емтихан күніне үлгермейсің. Нұсқалар: күніне ${mn} минут, ${dt} кейінгі күн немесе C1 орнына B2.`,
    dateExact: "Нақты күн", dateApprox: "Шамамен", dateUnknown: "Білмеймін", months: "ай", examSaved: "Сақталды ✓", saveExam: "Сақтау",
    sub: "Жазылым", currentPlan: "Ағымдағы жоспар", validUntil: "Дейін жарамды", manage: "Жазылымды басқару",
    notif: "Хабарламалар", emailNotif: "Email хабарламалар", reminders: "Сабақ еске салулары", remindTime: "Еске салу уақыты",
    lang: "Интерфейс тілі", delete: "Аккаунтты жою",
  },
};

const LANGS: { id: Locale; label: string }[] = [
  { id: "ru", label: "RU" },
  { id: "en", label: "EN" },
  { id: "tr", label: "TR" },
  { id: "kk", label: "KZ" },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-[var(--color-brand)]" : "bg-black/[0.15]"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="text-base font-semibold text-[var(--color-foreground)]">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { exam } = useExam();
  const { locale, setLocale } = useI18n();
  const c = pick(locale, T);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saved, setSaved] = useState(false);
  const [plan, setPlan] = useState<PackageId | null>(null);
  const [emailOn, setEmailOn] = useState(true);
  const [remindOn, setRemindOn] = useState(true);
  const [remindTime, setRemindTime] = useState("10:00");

  // exam plan (block D): real values from the profile, editable
  const [targetLevel, setTargetLevel] = useState<"B2" | "C1">("C1");
  const [dateMode, setDateMode] = useState<ExamDateMode>("unknown");
  const [examDate, setExamDate] = useState("");
  const [horizon, setHorizon] = useState<1 | 3 | 6>(3);
  const [minutes, setMinutes] = useState<number>(30);
  const [examSaved, setExamSaved] = useState(false);
  // honest consequence math: student level + already-mastered topics
  const [level, setLevel] = useState<string | null>(null);
  const [mastered, setMastered] = useState<string[]>([]);

  useEffect(() => {
    setName(window.localStorage.getItem("lingopro:name") || "");
    setPlan(loadPlan());
    let active = true;
    fetchProfileLocation().then((loc) => {
      if (!active) return;
      setCity(loc.city ?? "");
      setCountry(loc.country ?? "");
    });
    fetchExamPlan().then((p) => {
      if (!active || !p) return;
      setTargetLevel(p.targetLevel);
      setDateMode(p.examDateMode);
      setExamDate(p.examDate ?? "");
      if (p.examHorizonMonths) setHorizon(p.examHorizonMonths);
      if (p.minutesDaily) setMinutes(p.minutesDaily);
      setLevel(p.level);
    });
    createClient()
      .from("topic_mastery")
      .select("topic")
      .gte("strength", 60)
      .then(({ data }) => {
        if (active && data) setMastered(data.map((r) => r.topic as string));
      });
    return () => {
      active = false;
    };
  }, []);

  // live verdict: recomputed as the student toggles pace/date/target — the
  // consequence is visible BEFORE saving, never a silent rebuild
  const feasibility = useMemo(() => {
    if (!level) return null;
    const span = topicsForSpan(contentLevel(level), targetLevel);
    const done = new Set(mastered);
    const remaining = span.filter((t) => !done.has(t)).length;
    if (remaining === 0) return null;
    const daysLeft =
      dateMode === "exact" && examDate
        ? daysToExam({ examDateMode: "exact", examDate })
        : dateMode === "approx"
          ? horizon * 30
          : null;
    return assessFeasibility({ remainingTopics: remaining, minutesDaily: minutes, daysLeft });
  }, [level, targetLevel, dateMode, examDate, horizon, minutes, mastered]);

  async function saveExam() {
    await saveExamPlanToProfile({
      targetLevel,
      examDateMode: dateMode,
      examDate: dateMode === "exact" && examDate ? examDate : undefined,
      examHorizonMonths: dateMode === "approx" ? horizon : undefined,
    });
    await saveStudyMinutes(minutes);
    // changed inputs → the dashboard regenerates the route on its next load
    // (needsRegen/routeStale check); drop the session guard so it can fire
    try {
      window.sessionStorage.removeItem("lp:route-requested");
    } catch {
      /* ignore */
    }
    setExamSaved(true);
    setTimeout(() => setExamSaved(false), 1500);
  }

  function saveName() {
    window.localStorage.setItem("lingopro:name", name.trim());
    // persist city/country for the leaderboard scopes (best-effort)
    void saveProfileLocation(city.trim() || null, country.trim() || null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const inputCls = "rounded-xl border border-black/[0.1] bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15";

  return (
    <div className="flex flex-col gap-6">
      {/* profile */}
      <Section title={c.profile}>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-xl font-bold text-white">
            {(name || "S").charAt(0).toUpperCase()}
          </span>
          <button type="button" className="rounded-full border border-black/[0.1] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-black/[0.03]">
            {c.avatar}: {c.upload}
          </button>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-muted)]">{c.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-muted)]">{c.email}</span>
          <input value="student@lingopro.app" readOnly className={`${inputCls} cursor-not-allowed bg-black/[0.03] text-[var(--color-muted)]`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-muted)]">{c.city}</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={c.cityPh} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--color-muted)]">{c.country}</span>
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder={c.countryPh} className={inputCls} />
          </label>
        </div>
        <button type="button" onClick={saveName} className="btn-primary w-fit rounded-full px-5 py-2.5 text-sm">
          {saved ? c.saved : c.save}
        </button>
      </Section>

      {/* exam (block D: real profile values, editable) */}
      <Section title={c.exam}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">{c.chosenExam}</span>
          <span className="text-sm font-semibold text-[var(--color-foreground)]">{exam.flag} {exam.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">{c.target}</span>
          <div className="flex gap-1.5">
            {(["B2", "C1"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setTargetLevel(g)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${targetLevel === g ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[var(--color-muted)]">{c.examDate}</span>
          <div className="flex flex-wrap gap-1.5">
            {(["exact", "approx", "unknown"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDateMode(m)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${dateMode === m ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
              >
                {m === "exact" ? c.dateExact : m === "approx" ? c.dateApprox : c.dateUnknown}
              </button>
            ))}
          </div>
          {dateMode === "exact" && (
            <input type="date" value={examDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setExamDate(e.target.value)} className={inputCls} />
          )}
          {dateMode === "approx" && (
            <div className="flex gap-1.5">
              {([1, 3, 6] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${horizon === h ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
                >
                  ~{h} {c.months}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[var(--color-muted)]">{c.pace}</span>
          <div className="flex flex-wrap gap-1.5">
            {[15, 30, 45, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${minutes === m ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
              >
                {m === 60 ? "60+" : m}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted)]">{c.paceNote}</p>
        </div>

        {/* honest consequence of the chosen pace/date/target — live, before saving */}
        {feasibility && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              feasibility.verdict === "notEnough"
                ? "bg-[#dc2626]/[0.08] text-[#b91c1c]"
                : feasibility.verdict === "tight"
                  ? "bg-[#d97706]/10 text-[#92400e]"
                  : feasibility.verdict === "ok"
                    ? "bg-[#16a34a]/[0.08] text-[#15803d]"
                    : "bg-black/[0.04] text-[var(--color-muted)]"
            }`}
          >
            {feasibility.verdict === "unknown" && c.fUnknown(minutes, feasibility.daysNeeded, targetLevel)}
            {feasibility.verdict === "ok" && c.fOk(feasibility.daysNeeded, feasibility.daysLeft)}
            {feasibility.verdict === "tight" && c.fTight(feasibility.daysNeeded, feasibility.daysLeft)}
            {feasibility.verdict === "notEnough" &&
              c.fNotEnough(minutes, feasibility.minutesNeeded ?? minutes, feasibility.dateNeeded ?? "")}
          </div>
        )}

        <button type="button" onClick={saveExam} className="btn-primary w-fit rounded-full px-5 py-2.5 text-sm">
          {examSaved ? c.examSaved : c.saveExam}
        </button>
      </Section>

      {/* subscription */}
      <Section title={c.sub}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">{c.currentPlan}</span>
          <span className="text-sm font-semibold text-[var(--color-brand)]">{planBadge(plan, locale)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">{c.validUntil}</span>
          <span className="text-sm font-medium text-[var(--color-foreground)]">19.09.2026</span>
        </div>
        <button type="button" className="btn-ghost w-fit rounded-full px-5 py-2.5 text-sm font-medium">{c.manage}</button>
      </Section>

      {/* notifications */}
      <Section title={c.notif}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-foreground)]">{c.emailNotif}</span>
          <Toggle on={emailOn} onClick={() => setEmailOn((v) => !v)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-foreground)]">{c.reminders}</span>
          <Toggle on={remindOn} onClick={() => setRemindOn((v) => !v)} />
        </div>
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm text-[var(--color-muted)]">{c.remindTime}</span>
          <input type="time" value={remindTime} onChange={(e) => setRemindTime(e.target.value)} className={inputCls} />
        </label>
      </Section>

      {/* language */}
      <Section title={c.lang}>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLocale(l.id)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                locale === l.id ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      {/* delete */}
      <button type="button" className="w-fit rounded-full border border-[#dc2626]/30 px-5 py-2.5 text-sm font-medium text-[#dc2626] transition-colors hover:bg-[#dc2626]/[0.06]">
        {c.delete}
      </button>
    </div>
  );
}
