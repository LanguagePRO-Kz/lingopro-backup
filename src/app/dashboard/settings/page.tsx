"use client";

import { useEffect, useState } from "react";
import { useExam } from "@/lib/exam-context";
import { useI18n, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { loadPlan, type PackageId } from "@/lib/billing";
import { planBadge } from "@/lib/dashboard";
import { fetchProfileLocation, saveProfileLocation } from "@/lib/profile";

const T = {
  ru: {
    profile: "Профиль", name: "Имя", email: "Email", avatar: "Аватар", upload: "Загрузить", save: "Сохранить", saved: "Сохранено ✓",
    city: "Город", country: "Страна", cityPh: "Например, Алматы", countryPh: "Например, Казахстан",
    exam: "Экзамен", chosenExam: "Выбранный экзамен", target: "Целевой уровень", examDate: "Дата экзамена",
    sub: "Подписка", currentPlan: "Текущий план", validUntil: "Действует до", manage: "Управлять подпиской",
    notif: "Уведомления", emailNotif: "Email уведомления", reminders: "Напоминания о занятиях", remindTime: "Время напоминания",
    lang: "Язык интерфейса", delete: "Удалить аккаунт",
  },
  en: {
    profile: "Profile", name: "Name", email: "Email", avatar: "Avatar", upload: "Upload", save: "Save", saved: "Saved ✓",
    city: "City", country: "Country", cityPh: "e.g. Almaty", countryPh: "e.g. Kazakhstan",
    exam: "Exam", chosenExam: "Selected exam", target: "Target level", examDate: "Exam date",
    sub: "Subscription", currentPlan: "Current plan", validUntil: "Valid until", manage: "Manage subscription",
    notif: "Notifications", emailNotif: "Email notifications", reminders: "Lesson reminders", remindTime: "Reminder time",
    lang: "Interface language", delete: "Delete account",
  },
  tr: {
    profile: "Profil", name: "Ad", email: "E-posta", avatar: "Avatar", upload: "Yükle", save: "Kaydet", saved: "Kaydedildi ✓",
    city: "Şehir", country: "Ülke", cityPh: "örn. Almatı", countryPh: "örn. Kazakistan",
    exam: "Sınav", chosenExam: "Seçilen sınav", target: "Hedef seviye", examDate: "Sınav tarihi",
    sub: "Abonelik", currentPlan: "Mevcut plan", validUntil: "Geçerlilik", manage: "Aboneliği yönet",
    notif: "Bildirimler", emailNotif: "E-posta bildirimleri", reminders: "Ders hatırlatmaları", remindTime: "Hatırlatma saati",
    lang: "Arayüz dili", delete: "Hesabı sil",
  },
  kk: {
    profile: "Профиль", name: "Аты", email: "Email", avatar: "Аватар", upload: "Жүктеу", save: "Сақтау", saved: "Сақталды ✓",
    city: "Қала", country: "Ел", cityPh: "мыс. Алматы", countryPh: "мыс. Қазақстан",
    exam: "Емтихан", chosenExam: "Таңдалған емтихан", target: "Мақсатты деңгей", examDate: "Емтихан күні",
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
  const [examDate, setExamDate] = useState("2026-09-19");

  useEffect(() => {
    setName(window.localStorage.getItem("lingopro:name") || "");
    setPlan(loadPlan());
    let active = true;
    fetchProfileLocation().then((loc) => {
      if (!active) return;
      setCity(loc.city ?? "");
      setCountry(loc.country ?? "");
    });
    return () => {
      active = false;
    };
  }, []);

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

      {/* exam */}
      <Section title={c.exam}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">{c.chosenExam}</span>
          <span className="text-sm font-semibold text-[var(--color-foreground)]">{exam.flag} {exam.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">{c.target}</span>
          <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-brand)]">C1</span>
        </div>
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm text-[var(--color-muted)]">{c.examDate}</span>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={inputCls} />
        </label>
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
