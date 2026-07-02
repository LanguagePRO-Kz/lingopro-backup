"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";

/* ---- seeded "joined in the last hour" figure (stable within the hour) ---- */
const CURVE = [
  0.04, 0.03, 0.03, 0.04, 0.05, 0.08,
  0.2, 0.35, 0.55,
  0.75, 0.85, 0.9, 0.95, 1.0, 0.95, 0.9, 0.85, 0.78,
  0.7, 0.6, 0.45, 0.35, 0.25, 0.1,
];
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}
function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0).getTime();
  return Math.floor((d.getTime() - start) / 86_400_000);
}
function hourlyJoined(d: Date) {
  const hour = d.getHours();
  const seed = dayOfYear(d) * 100 + hour;
  const base = 8 + rand(seed) * 24;
  return Math.max(3, Math.round(base * CURVE[hour]));
}

const T = {
  ru: { headline: "Студенты начали подготовку с LingoPRO:", joinedTpl: "{n} человек присоединились к {brand} за последний час", months: { "1m": "1 месяц", "3m": "3 месяца", "6m": "6 месяцев" } },
  en: { headline: "Students started preparing with LingoPRO:", joinedTpl: "{n} people joined {brand} in the last hour", months: { "1m": "1 month", "3m": "3 months", "6m": "6 months" } },
  tr: { headline: "Öğrenciler LingoPRO ile hazırlanmaya başladı:", joinedTpl: "{n} kişi son bir saatte {brand}'ya katıldı", months: { "1m": "1 ay", "3m": "3 ay", "6m": "6 ay" } },
  kk: { headline: "Студенттер LingoPRO-мен дайындыққа кірісті:", joinedTpl: "{n} адам соңғы сағатта {brand}-ға қосылды", months: { "1m": "1 ай", "3m": "3 ай", "6m": "6 ай" } },
};

const PLAQUES: { name: string; plan: "1m" | "3m" | "6m" }[] = [
  { name: "aige****", plan: "3m" },
  { name: "timur***", plan: "6m" },
  { name: "dana.***", plan: "1m" },
  { name: "bekz***", plan: "3m" },
  { name: "madi****", plan: "6m" },
  { name: "asel***", plan: "1m" },
];

const PILL = "flex shrink-0 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3.5 py-2 text-sm text-[var(--color-foreground)] shadow-sm";

export function PricingTicker() {
  const { locale } = useI18n();
  const c = pick(locale, T);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(hourlyJoined(new Date()));
    const id = setInterval(() => setCount(hourlyJoined(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  function counterCard(key: string) {
    const parts = c.joinedTpl.split(/(\{n\}|\{brand\})/).map((seg, i) => {
      if (seg === "{n}") return <span key={i} className="font-bold text-[#7C3AED]">{count ?? "—"}</span>;
      if (seg === "{brand}") return <span key={i} className="font-bold text-[#7C3AED]">LingoPRO</span>;
      return <span key={i}>{seg}</span>;
    });
    return (
      <span key={key} className={PILL}>
        <Flame size={16} className="shrink-0 text-[#f97316]" /> <span className="leading-none">{parts}</span>
      </span>
    );
  }

  const nodes: ReactNode[] = [
    <span key="head" className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-brand)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-brand)]">
      <Flame size={16} className="shrink-0" /> {c.headline}
    </span>,
  ];
  PLAQUES.forEach((p, i) => {
    nodes.push(
      <span key={`p${i}`} className={PILL}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-2)] text-[10px] font-bold text-white">
          {p.name.charAt(0).toUpperCase()}
        </span>
        <span className="font-medium">{p.name}</span>
        <span className="text-[var(--color-muted)]">· {c.months[p.plan]}</span>
      </span>,
    );
    if ((i + 1) % 3 === 0) nodes.push(counterCard(`c${i}`));
  });

  const items = <div className="flex shrink-0 items-center gap-3 pr-3">{nodes}</div>;

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <motion.div className="flex w-max" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }}>
        {items}
        {items}
      </motion.div>
    </div>
  );
}
