"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { pick } from "@/lib/localized";
import { SectionHeading } from "./ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "./ui/Reveal";

/** Real student certificates (public/certificates). Cities stay localized. */
const CERTS: { src: string; name: string; city: { ru: string; en: string; tr: string; kk: string } }[] = [
  { src: "/certificates/cert-1.png", name: "Aizhan A.", city: { ru: "Алматы", en: "Almaty", tr: "Almatı", kk: "Алматы" } },
  { src: "/certificates/cert-2.png", name: "Dilyaram Zh.", city: { ru: "Актау", en: "Aktau", tr: "Aktau", kk: "Ақтау" } },
  { src: "/certificates/cert-3.png", name: "Anel S.", city: { ru: "Астана", en: "Astana", tr: "Astana", kk: "Астана" } },
];

export function Certificates() {
  const { t, locale } = useI18n();
  const c = t.certificates;

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={c.title} subtitle={c.subtitle} />

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CERTS.map((cert) => (
            <StaggerItem key={cert.src}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_-12px_rgba(16,24,40,0.18)] ring-1 ring-black/[0.05]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={cert.src}
                    alt={`${c.certWord} TÖMER — ${cert.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-center justify-between p-5">
                  <span className="text-sm font-semibold text-[var(--color-foreground)]">{cert.name}</span>
                  <span className="text-xs text-[var(--color-muted)]">{pick(locale, cert.city)}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
