"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, LineChart, Wallet } from "lucide-react";
import { Background } from "@/components/ui/Background";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

const STUDENT_OPTIONS = ["10–30", "30–100", "100+"];

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function B2BPage() {
  const { t } = useI18n();
  const b = t.pages.b2b;
  const BENEFITS = [
    { Icon: Users, title: b.benefitAccessTitle, text: b.benefitAccessText },
    { Icon: LineChart, title: b.benefitAnalyticsTitle, text: b.benefitAnalyticsText },
    { Icon: Wallet, title: b.benefitPlansTitle, text: b.benefitPlansText },
  ];

  const [school, setSchool] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [students, setStudents] = useState(STUDENT_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!school.trim() || !contact.trim()) {
      setError(b.errRequired);
      return;
    }
    if (!isEmail(email)) {
      setError(b.errEmail);
      return;
    }

    setLoading(true);
    const payload = {
      school_name: school.trim(),
      contact_name: contact.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      student_count: students,
    };

    try {
      const { error: dbError } = await createClient().from("b2b_leads").insert(payload);
      if (dbError) throw dbError;
    } catch {
      // fallback: открыть письмо на lingopro2026@gmail.com
      const body = encodeURIComponent(
        `Школа: ${payload.school_name}\nКонтакт: ${payload.contact_name}\nEmail: ${payload.email}\nТелефон: ${payload.phone ?? "—"}\nКоличество студентов: ${payload.student_count}`,
      );
      window.location.href = `mailto:lingopro2026@gmail.com?subject=${encodeURIComponent("Заявка от школы — " + payload.school_name)}&body=${body}`;
    }

    setLoading(false);
    setSent(true);
  }

  const inputCls =
    "w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15";

  return (
    <>
      <Background />

      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">
            Lingo<span className="text-gradient">PRO</span>
          </span>
        </Link>
        <Link href="/" className="text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]">
          ← {t.pages.back}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {b.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base text-[var(--color-muted)] sm:text-lg">
            {b.subtitle}
          </p>
        </div>

        {/* benefits */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="glass flex h-full flex-col gap-3 rounded-3xl p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                <b.Icon size={22} />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-foreground)]">{b.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">{b.text}</p>
            </div>
          ))}
        </div>

        {/* form */}
        <div className="glass-strong mx-auto mt-12 w-full max-w-xl rounded-3xl p-6 sm:p-8">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-2)]/15 text-3xl text-[var(--color-brand-2)]">
                ✓
              </div>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">
                {b.success}
              </p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-xl font-bold tracking-tight">{b.formTitle}</h2>
              <form className="mt-5 flex flex-col gap-4" onSubmit={submit}>
                <Field label={b.school} value={school} onChange={setSchool} placeholder={b.schoolPh} required />
                <Field label={b.contact} value={contact} onChange={setContact} placeholder={b.contactPh} required />
                <Field label={b.email} type="email" value={email} onChange={setEmail} placeholder="you@school.com" required />
                <Field label={b.phone} type="tel" value={phone} onChange={setPhone} placeholder="+7 (___) ___-__-__" />
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-muted)]">{b.students}</span>
                  <select value={students} onChange={(e) => setStudents(e.target.value)} className={inputCls}>
                    {STUDENT_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>

                {error && <p className="text-sm font-medium text-[#dc2626]">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary mt-1 rounded-full px-6 py-3.5 text-sm disabled:opacity-60">
                  {loading ? b.sending : b.submit}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-muted)]">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition-all placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
      />
    </label>
  );
}
