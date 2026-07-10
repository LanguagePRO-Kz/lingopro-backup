"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { locale } = useI18n();
  return (
    // key={locale}: дети, у которых key — ПЕРЕВОДНАЯ строка, при смене языка
    // пересоздаются и рождаются в variant "hidden", а одноразовый whileInView
    // родителя уже отработал → «пропавшие карточки до перезагрузки страницы».
    // Ремоунт группы по локали заново запускает in-view анимацию целиком.
    <motion.div
      key={locale}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.09 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
