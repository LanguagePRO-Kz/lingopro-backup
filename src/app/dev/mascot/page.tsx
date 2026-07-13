import { notFound } from "next/navigation";
import { MascotGallery } from "./MascotGallery";

/**
 * Dev-галерея маскота (DESIGN-COACH §14): 8 эмоций Ahu, 4 стадии символа
 * роста, 15 бейджей титулов — проверка глазами перед выкатом.
 * В production-сборке страницы НЕТ (404) — инструмент, не фича.
 */
export default function MascotDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MascotGallery />;
}
