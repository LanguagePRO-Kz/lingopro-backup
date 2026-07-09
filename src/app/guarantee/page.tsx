import { GuaranteeContent } from "./GuaranteeContent";

export const metadata = {
  title: "Гарантия повышения уровня — LingoPRO",
  description:
    "Гарантия вступает в силу с запуском оплаты: если за 3 месяца подготовки уровень не вырос минимум на ступень — вернём 100% стоимости подписки.",
};

export default function GuaranteePage() {
  return <GuaranteeContent />;
}
