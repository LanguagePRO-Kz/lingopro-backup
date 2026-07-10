import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ExamProvider } from "@/lib/exam-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://lingopro.app";
const TITLE = "Подготовка к TÖMER с AI — персональный план и пробные экзамены";
const DESCRIPTION =
  "Пройдите AI-диагностику турецкого языка, получите честный персональный план подготовки к TÖMER под вашу цель и дату экзамена и занимайтесь с AI-преподавателем 24/7 для поступления в университет Турции.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · LingoPRO",
  },
  description: DESCRIPTION,
  applicationName: "LingoPRO",
  keywords: [
    "LingoPRO",
    "TÖMER",
    "турецкий язык",
    "подготовка к экзамену",
    "AI-преподаватель",
    "учёба в Турции",
    "диагностика уровня",
  ],
  authors: [{ name: "LingoPRO" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "LingoPRO",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalApplication",
  name: "LingoPRO",
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: DESCRIPTION,
  inLanguage: ["ru", "kk", "en", "tr"],
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Бесплатная AI-диагностика уровня турецкого языка",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <I18nProvider>
          <ExamProvider>{children}</ExamProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
