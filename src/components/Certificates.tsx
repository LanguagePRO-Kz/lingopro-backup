"use client";

import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { useExam } from "@/lib/exam-context";
import { SectionHeading } from "./ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "./ui/Reveal";

type Cert = { name: string; city: string };
type Content = { title: string; subtitle: string; certWord: string; preview: string; certs: Cert[] };

const CONTENT: { ru: Content; en: Content; tr: Content; kk: Content } = {
  ru: {
    title: "Реальные результаты наших студентов",
    subtitle: "Сертификаты, полученные после подготовки на платформе.",
    certWord: "Сертификат",
    preview: "превью",
    certs: [
      { name: "Айгерим Н.", city: "Алматы" },
      { name: "Тимур Р.", city: "Ташкент" },
      { name: "Дария К.", city: "Астана" },
    ],
  },
  en: {
    title: "Real results from our students",
    subtitle: "Certificates earned after preparing on the platform.",
    certWord: "Certificate",
    preview: "preview",
    certs: [
      { name: "Aigerim N.", city: "Almaty" },
      { name: "Timur R.", city: "Tashkent" },
      { name: "Daria K.", city: "Astana" },
    ],
  },
  tr: {
    title: "Öğrencilerimizden gerçek sonuçlar",
    subtitle: "Platformda hazırlık sonrası alınan sertifikalar.",
    certWord: "Sertifika",
    preview: "önizleme",
    certs: [
      { name: "Aigerim N.", city: "Almatı" },
      { name: "Timur R.", city: "Taşkent" },
      { name: "Daria K.", city: "Astana" },
    ],
  },
  kk: {
    title: "Студенттеріміздің нақты нәтижелері",
    subtitle: "Платформада дайындықтан кейін алынған сертификаттар.",
    certWord: "Сертификат",
    preview: "алдын ала",
    certs: [
      { name: "Айгерім Н.", city: "Алматы" },
      { name: "Тимур Р.", city: "Ташкент" },
      { name: "Дария К.", city: "Астана" },
    ],
  },
};

export function Certificates() {
  const { locale } = useI18n();
  const { exam } = useExam();
  const c = pick(locale, CONTENT);

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={c.title} subtitle={c.subtitle} />

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.certs.map((cert) => (
            <StaggerItem key={cert.name}>
              <div className="card-glow glass flex h-full flex-col overflow-hidden rounded-3xl">
                {/* certificate placeholder */}
                <div className="relative aspect-[4/3] border-b border-black/[0.06] bg-gradient-to-br from-[var(--color-brand)]/8 to-[var(--color-brand-2)]/8">
                  <div className="dot-grid absolute inset-0 opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                    <span className="text-3xl">{exam.flag}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      {c.certWord} {exam.name}
                    </span>
                    <span className="text-4xl font-bold text-gradient">C1</span>
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">
                    {c.preview}
                  </span>
                </div>
                <div className="flex items-center justify-between p-5">
                  <span className="text-sm font-semibold text-[var(--color-foreground)]">{cert.name}</span>
                  <span className="text-xs text-[var(--color-muted)]">{cert.city}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
