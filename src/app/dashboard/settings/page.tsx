"use client";

import { useEffect, useMemo, useState } from "react";
import { useExam } from "@/lib/exam-context";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { contentLevel } from "@/lib/daily-plan";
import { planBadge } from "@/lib/dashboard";
import { PACE_CHOICES } from "@/lib/plan/feasibility";
import { PlanVerdictCard } from "@/components/PlanVerdictCard";
import { fetchProfile, fetchProfileLocation, saveProfileLocation } from "@/lib/profile";
import { setOnboarded } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/client";
import { daysToExam, fetchExamPlan, saveExamPlanToProfile, saveStudyMinutes, type ExamDateMode } from "@/lib/exam-plan";

const T = {
  ru: {
    profile: "Профиль", name: "Имя", email: "Email", avatar: "Аватар", upload: "Загрузить", save: "Сохранить", saved: "Сохранено ✓",
    city: "Город", country: "Страна", cityPh: "Например, Алматы", countryPh: "Например, Казахстан",
    exam: "Экзамен", chosenExam: "Выбранный экзамен", target: "Целевой уровень", examDate: "Дата экзамена",
    pace: "Минут в день", paceNote: "Дневной план пересоберётся под новый темп при следующем открытии дашборда.",
    bonusTitle: "Хочется больше двух часов?",
    bonusBody: "Сверх плана — мягкая практика, без давления: повторяй слова в транспорте, слушай турецкие подкасты, вечером — серия сериала с субтитрами. Это бонус, не обязательство.",
    dateFlexQ: "Эту дату можно перенести?",
    dateFlex: "Могу перенести", dateFixed: "Жёсткая — уже есть запись",
    dateExact: "Точная дата", dateApprox: "Примерно", dateUnknown: "Не знаю", months: "мес", examSaved: "Сохранено ✓", saveExam: "Сохранить",
    sub: "Подписка", currentPlan: "Текущий план", validUntil: "Действует до", manage: "Управлять подпиской",
    notif: "Уведомления", emailNotif: "Email уведомления", reminders: "Напоминания о занятиях", remindTime: "Время напоминания",
    lang: "Язык интерфейса", delete: "Удалить аккаунт",
    help: "Подсказки", helpReset: "Показать чек-лист и подсказки заново", helpResetDone: "Готово — они снова появятся в кабинете ✓",
  },
  en: {
    profile: "Profile", name: "Name", email: "Email", avatar: "Avatar", upload: "Upload", save: "Save", saved: "Saved ✓",
    city: "City", country: "Country", cityPh: "e.g. Almaty", countryPh: "e.g. Kazakhstan",
    exam: "Exam", chosenExam: "Selected exam", target: "Target level", examDate: "Exam date",
    pace: "Minutes per day", paceNote: "Your daily plan rebuilds to the new pace the next time you open the dashboard.",
    bonusTitle: "Want more than two hours?",
    bonusBody: "Beyond the plan — soft practice, zero pressure: review words on the commute, listen to Turkish podcasts, watch an episode with subtitles in the evening. A bonus, not an obligation.",
    dateFlexQ: "Can this date move?",
    dateFlex: "I can move it", dateFixed: "Locked — I'm registered",
    dateExact: "Exact date", dateApprox: "Approx.", dateUnknown: "Not sure", months: "mo", examSaved: "Saved ✓", saveExam: "Save",
    sub: "Subscription", currentPlan: "Current plan", validUntil: "Valid until", manage: "Manage subscription",
    notif: "Notifications", emailNotif: "Email notifications", reminders: "Lesson reminders", remindTime: "Reminder time",
    lang: "Interface language", delete: "Delete account",
    help: "Hints", helpReset: "Show the checklist and hints again", helpResetDone: "Done — they'll reappear in the cabinet ✓",
  },
  tr: {
    profile: "Profil", name: "Ad", email: "E-posta", avatar: "Avatar", upload: "Yükle", save: "Kaydet", saved: "Kaydedildi ✓",
    city: "Şehir", country: "Ülke", cityPh: "örn. Almatı", countryPh: "örn. Kazakistan",
    exam: "Sınav", chosenExam: "Seçilen sınav", target: "Hedef seviye", examDate: "Sınav tarihi",
    pace: "Günde dakika", paceNote: "Günlük plan, panoyu bir sonraki açışında yeni tempoya göre yeniden kurulur.",
    bonusTitle: "İki saatten fazlasını mı istiyorsun?",
    bonusBody: "Planın ötesi — baskısız, yumuşak pratik: yolda kelime tekrar et, Türkçe podcast dinle, akşam altyazılı bir bölüm izle. Bu bir bonus, zorunluluk değil.",
    dateFlexQ: "Bu tarih ertelenebilir mi?",
    dateFlex: "Erteleyebilirim", dateFixed: "Kesin — kaydım var",
    dateExact: "Kesin tarih", dateApprox: "Yaklaşık", dateUnknown: "Bilmiyorum", months: "ay", examSaved: "Kaydedildi ✓", saveExam: "Kaydet",
    sub: "Abonelik", currentPlan: "Mevcut plan", validUntil: "Geçerlilik", manage: "Aboneliği yönet",
    notif: "Bildirimler", emailNotif: "E-posta bildirimleri", reminders: "Ders hatırlatmaları", remindTime: "Hatırlatma saati",
    lang: "Arayüz dili", delete: "Hesabı sil",
    help: "İpuçları", helpReset: "Kontrol listesini ve ipuçlarını yeniden göster", helpResetDone: "Tamam — kabinde yeniden görünecekler ✓",
  },
  kk: {
    profile: "Профиль", name: "Аты", email: "Email", avatar: "Аватар", upload: "Жүктеу", save: "Сақтау", saved: "Сақталды ✓",
    city: "Қала", country: "Ел", cityPh: "мыс. Алматы", countryPh: "мыс. Қазақстан",
    exam: "Емтихан", chosenExam: "Таңдалған емтихан", target: "Мақсатты деңгей", examDate: "Емтихан күні",
    pace: "Күніне минут", paceNote: "Күнделікті жоспар келесі жолы дашбордты ашқанда жаңа қарқынға сай қайта құрылады.",
    bonusTitle: "Екі сағаттан көп айналысқың келе ме?",
    bonusBody: "Жоспардан тыс — қысымсыз, жұмсақ практика: жолда сөздерді қайтала, түрікше подкаст тыңда, кешке субтитрмен бір серия көр. Бұл бонус, міндет емес.",
    dateFlexQ: "Бұл күнді ауыстыруға бола ма?",
    dateFlex: "Ауыстыра аламын", dateFixed: "Бекітілген — тіркелгенмін",
    dateExact: "Нақты күн", dateApprox: "Шамамен", dateUnknown: "Білмеймін", months: "ай", examSaved: "Сақталды ✓", saveExam: "Сақтау",
    sub: "Жазылым", currentPlan: "Ағымдағы жоспар", validUntil: "Дейін жарамды", manage: "Жазылымды басқару",
    notif: "Хабарламалар", emailNotif: "Email хабарламалар", reminders: "Сабақ еске салулары", remindTime: "Еске салу уақыты",
    lang: "Интерфейс тілі", delete: "Аккаунтты жою",
    help: "Кеңестер", helpReset: "Чек-лист пен кеңестерді қайта көрсету", helpResetDone: "Дайын — олар кабинетте қайта шығады ✓",
  },
};

const LANGS: { id: Locale; label: string }[] = [
  { id: "ru", label: "RU" },
  { id: "en", label: "EN" },
  { id: "tr", label: "TR" },
  { id: "kk", label: "KZ" },
];

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
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saved, setSaved] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  // exam plan (block D): real values from the profile, editable
  const [targetLevel, setTargetLevel] = useState<"B2" | "C1">("C1");
  const [dateMode, setDateMode] = useState<ExamDateMode>("unknown");
  const [examDate, setExamDate] = useState("");
  const [dateFlexible, setDateFlexible] = useState<boolean | null>(null);
  const [horizon, setHorizon] = useState<1 | 3 | 6>(3);
  const [minutes, setMinutes] = useState<number>(30);
  const [examSaved, setExamSaved] = useState(false);
  const [hintsReset, setHintsReset] = useState(false);
  // honest consequence math: student level + already-mastered topics
  const [level, setLevel] = useState<string | null>(null);
  const [mastered, setMastered] = useState<string[]>([]);

  useEffect(() => {
    setName(window.localStorage.getItem("lingopro:name") || "");
    // пакет — из профиля БД (доступ решает сервер; localStorage-флага нет)
    void fetchProfile().then((p) => setPlan((p?.plan as string | null) ?? null));
    let active = true;
    // the real account email — «student@lingopro.app» for everyone was a lie
    void createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active && data.user?.email) setEmail(data.user.email);
      });
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
      setDateFlexible(p.examDateFlexible ?? null);
      if (p.examHorizonMonths) setHorizon(p.examHorizonMonths);
      // 180/240 saved before the 2h cap → shown (and re-saved) as 120
      if (p.minutesDaily) setMinutes(Math.min(120, p.minutesDaily));
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

  // live verdict input: recomputed as the student toggles pace/date/target —
  // the consequence is visible BEFORE saving, never a silent rebuild
  const verdictDaysLeft = useMemo(
    () =>
      dateMode === "exact" && examDate
        ? daysToExam({ examDateMode: "exact", examDate })
        : dateMode === "approx"
          ? horizon * 30
          : null,
    [dateMode, examDate, horizon],
  );

  async function saveExam() {
    await saveExamPlanToProfile({
      targetLevel,
      examDateMode: dateMode,
      examDate: dateMode === "exact" && examDate ? examDate : undefined,
      examHorizonMonths: dateMode === "approx" ? horizon : undefined,
      examDateFlexible: dateMode === "exact" ? (dateFlexible ?? undefined) : undefined,
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
        {/* avatar upload removed until it works (UX-audit #11: dead buttons) */}
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-xl font-bold text-white">
            {(name || "S").charAt(0).toUpperCase()}
          </span>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-muted)]">{c.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-muted)]">{c.email}</span>
          <input value={email || "…"} readOnly className={`${inputCls} cursor-not-allowed bg-black/[0.03] text-[var(--color-muted)]`} />
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
            <>
              <input type="date" value={examDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setExamDate(e.target.value)} className={inputCls} />
              {/* locked vs movable date — decides mobilization vs alternatives */}
              <span className="mt-1 text-xs text-[var(--color-muted)]">{c.dateFlexQ}</span>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { v: true, label: c.dateFlex },
                  { v: false, label: c.dateFixed },
                ] as const).map((o) => (
                  <button
                    key={String(o.v)}
                    type="button"
                    onClick={() => setDateFlexible(o.v)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${dateFlexible === o.v ? "bg-[var(--color-brand)]/12 text-[var(--color-brand)]" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
                  >
                    {o.v ? "🔄" : "📌"} {o.label}
                  </button>
                ))}
              </div>
            </>
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
            {PACE_CHOICES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${minutes === m ? "bg-[var(--color-brand)] text-white" : "bg-black/[0.05] text-[var(--color-muted)] hover:bg-black/[0.08]"}`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-muted)]">{c.paceNote}</p>
          {/* founder: the PLAN caps at 2 h/day; beyond that — soft bonus
              practice, stated without pressure */}
          <div className="rounded-2xl bg-black/[0.03] px-4 py-3">
            <div className="text-xs font-semibold text-[var(--color-foreground)]">🌿 {c.bonusTitle}</div>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{c.bonusBody}</p>
          </div>
        </div>

        {/* honest consequence of the chosen pace/date/target — live, before
            saving; the buttons apply the alternative right into the form */}
        {level && (
          <PlanVerdictCard
            // A0 stays A0 here: contentLevel would round it up to A1 and
            // silently strip 80 honest hours off the ladder
            level={level === "A0" ? "A0" : contentLevel(level)}
            targetLevel={targetLevel}
            minutesDaily={minutes}
            daysLeft={verdictDaysLeft}
            examDateFlexible={dateMode === "exact" ? dateFlexible : true}
            masteredTopics={mastered}
            onApplyMinutes={setMinutes}
            onApplyDate={(d) => {
              setDateMode("exact");
              setExamDate(d);
            }}
            onApplyTarget={() => setTargetLevel("B2")}
          />
        )}

        <button type="button" onClick={saveExam} className="btn-primary w-fit rounded-full px-5 py-2.5 text-sm">
          {examSaved ? c.examSaved : c.saveExam}
        </button>
      </Section>

      {/* subscription — plan badge only; the fake «valid until» date and the
          dead «manage» button are gone until billing exists (UX-audit #11);
          notification toggles removed too — they saved nowhere */}
      <Section title={c.sub}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">{c.currentPlan}</span>
          <span className="text-sm font-semibold text-[var(--color-brand)]">{planBadge(plan, locale)}</span>
        </div>
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

      {/* onboarding hints */}
      <Section title={c.help}>
        <button
          type="button"
          disabled={hintsReset}
          onClick={async () => {
            // AWAITED: navigating away before the profile null-write landed
            // used to race the dashboard read and re-bury the checklist
            await setOnboarded(false); // re-opens the checklist + resets hints
            setHintsReset(true);
            setTimeout(() => setHintsReset(false), 2500);
          }}
          className="btn-ghost w-fit rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {hintsReset ? c.helpResetDone : c.helpReset}
        </button>
      </Section>

      {/* delete — a working request channel until self-service deletion is
          built (a dead legally-important button was worse: UX-audit #11) */}
      <a
        href={`mailto:support@lingopro.app?subject=${encodeURIComponent("Удаление аккаунта / Account deletion")}&body=${encodeURIComponent(`Прошу удалить мой аккаунт: ${email}`)}`}
        className="w-fit rounded-full border border-[#dc2626]/30 px-5 py-2.5 text-sm font-medium text-[#dc2626] transition-colors hover:bg-[#dc2626]/[0.06]"
      >
        {c.delete}
      </a>
    </div>
  );
}
