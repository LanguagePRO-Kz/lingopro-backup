/**
 * Честные шаблоны Ahu без AI — фолбэк, когда AI недоступен/квота кончилась.
 * Один источник на все состояния ×4 языка (поглощает старые motivate() из
 * studyplan.ts и getMotivation() из daily-plan.ts — их удалит этап каналов).
 *
 * Правила: только цифры из снапшота, никакой лести на нуле, формулировки
 * гендерно-нейтральные (шаблон не знает форм «сделал/сделала» заранее —
 * в RU/KK избегаем прошедшего времени 2-го лица).
 */

import type { Locale } from "@/lib/i18n";
import { topicById } from "@/lib/ai/topics";
import type { CoachDecision, StudentSnapshot } from "./types";
import { activityOf } from "./states";

const label = (id: string | undefined, locale: Locale): string =>
  id ? (topicById(id)?.label[locale] ?? id) : "";

/** Текст дня от Ahu без AI — по главному состоянию решения. */
export function coachFallbackText(s: StudentSnapshot, d: CoachDecision, locale: Locale): string {
  const act = activityOf(s);
  const st = d.state;
  const t = (ru: string, en: string, tr: string, kk: string) => ({ ru, en, tr, kk })[locale];

  switch (st.id) {
    case "NEWBIE":
      return t(
        "Добро пожаловать! План первого дня готов — начни с первого задания, 10 минут уже двигают к цели.",
        "Welcome! Your first day's plan is ready — start with the first task, even 10 minutes move you forward.",
        "Hoş geldin! İlk günün planı hazır — ilk görevle başla, 10 dakika bile seni ileri taşır.",
        "Қош келдің! Алғашқы күннің жоспары дайын — бірінші тапсырмадан баста, 10 минуттың өзі алға жылжытады.",
      );
    case "EXAM_SOON":
      return t(
        `До экзамена ${st.daysToExam} дн. — сейчас решают формат и повторение. Сегодня: план дня${st.lastMockTotal == null ? " и пробный раздел" : ""}.`,
        `${st.daysToExam} days to the exam — format practice and review decide it now. Today: your plan${st.lastMockTotal == null ? " plus a mock section" : ""}.`,
        `Sınava ${st.daysToExam} gün var — artık format ve tekrar belirleyici. Bugün: günün planı${st.lastMockTotal == null ? " ve bir deneme bölümü" : ""}.`,
        `Емтиханға ${st.daysToExam} күн қалды — қазір формат пен қайталау шешеді. Бүгін: күн жоспары${st.lastMockTotal == null ? " және бір сынақ бөлімі" : ""}.`,
      );
    case "STREAK_BROKEN":
      return t(
        `${st.daysSinceActivity} дн. без занятий — бывает. Вернись сегодня с одного задания, серия начнётся заново.`,
        `${st.daysSinceActivity} days off — it happens. Come back with one task today and restart your streak.`,
        `${st.daysSinceActivity} gündür ara var — olur böyle. Bugün tek görevle dön, seri yeniden başlasın.`,
        `${st.daysSinceActivity} күн үзіліс болды — кездеседі. Бүгін бір тапсырмамен орал, серия қайта басталады.`,
      );
    case "TOPIC_FAILED":
      return t(
        `Тема «${label(st.topic, locale)}» проседает (${st.strength}/100). Сегодня стоит разобрать её — голосовой урок с Ahu самое быстрое.`,
        `“${label(st.topic, locale)}” is weak (${st.strength}/100). Worth tackling today — a voice lesson with Ahu is the fastest way.`,
        `«${label(st.topic, locale)}» konusu zayıf (${st.strength}/100). Bugün ele almakta fayda var — Ahu ile sesli ders en hızlısı.`,
        `«${label(st.topic, locale)}» тақырыбы әлсіз (${st.strength}/100). Бүгін қарастырған жөн — Ahu-мен дауыстық сабақ ең жылдамы.`,
      );
    case "BEHIND":
      return st.reason === "deadline"
        ? t(
            "При текущем темпе к дате экзамена не успеть — честно. Загляни в настройки: больше минут в день или другая дата.",
            "At the current pace the exam date is out of reach — honestly. Check settings: more minutes per day or another date.",
            "Bu tempoyla sınav tarihine yetişmiyor — dürüst olalım. Ayarlara bak: günde daha çok dakika ya da başka bir tarih.",
            "Қазіргі қарқынмен емтихан күніне үлгермейміз — шынын айтқанда. Баптауларға қара: күніне көбірек минут немесе басқа күн.",
          )
        : t(
            `За неделю выполнено ${st.weekDonePct}% плана. Не наверстывай всё разом — одно задание сегодня уже поворот.`,
            `${st.weekDonePct}% of the week's plan is done. Don't catch up all at once — one task today is already a turn.`,
            `Bu hafta planın %${st.weekDonePct}'i yapıldı. Hepsini birden telafi etme — bugün tek görev bile dönüş demek.`,
            `Осы аптада жоспардың ${st.weekDonePct}%-ы орындалды. Бәрін бірден қуып жетпе — бүгінгі бір тапсырманың өзі бетбұрыс.`,
          );
    case "BREAKTHROUGH":
      return st.kind === "topic_closed"
        ? t(
            `Тема «${label(st.topic, locale)}» закрыта — 60+. Это реальный шаг к ${s.targetLevel}. Держим темп.`,
            `“${label(st.topic, locale)}” is closed — 60+. A real step toward ${s.targetLevel}. Keep the pace.`,
            `«${label(st.topic, locale)}» konusu kapandı — 60+. ${s.targetLevel} yolunda gerçek bir adım. Tempoyu koru.`,
            `«${label(st.topic, locale)}» тақырыбы жабылды — 60+. Бұл ${s.targetLevel} жолындағы нақты қадам. Қарқынды ұстайық.`,
          )
        : t(
            `Пробный ${st.mockTotal}/100 — на ${st.mockDelta} балл(а) выше прошлого. Рост реальный, продолжаем.`,
            `Mock ${st.mockTotal}/100 — ${st.mockDelta} points above the last one. Real growth, keep going.`,
            `Deneme ${st.mockTotal}/100 — öncekinden ${st.mockDelta} puan yukarı. Gerçek bir yükseliş, devam.`,
            `Сынақ ${st.mockTotal}/100 — өткеннен ${st.mockDelta} ұпайға жоғары. Өсу нақты, жалғастырамыз.`,
          );
    case "PLATEAU":
      return t(
        `Занятия идут стабильно, но «${label(st.topic, locale)}» не тронута уже ${st.daysSincePracticed} дн. и всё ещё слабая (${st.strength}/100). Сегодня — она.`,
        `You're studying steadily, but “${label(st.topic, locale)}” hasn't been touched for ${st.daysSincePracticed} days and is still weak (${st.strength}/100). Today — that one.`,
        `Düzenli çalışıyorsun ama «${label(st.topic, locale)}» ${st.daysSincePracticed} gündür el değmedi ve hâlâ zayıf (${st.strength}/100). Bugün sırası onda.`,
        `Тұрақты айналысып жүрсің, бірақ «${label(st.topic, locale)}» ${st.daysSincePracticed} күн қозғалмады және әлі әлсіз (${st.strength}/100). Бүгін — соған кезек.`,
      );
    case "ON_TRACK": {
      const today = act.todayPlan;
      if (today && today.total > 0 && today.done >= today.total) {
        return t(
          `Все ${today.total} задания на сегодня закрыты${act.streak > 1 ? `, серия ${act.streak} дн.` : ""} — так и держим.`,
          `All ${today.total} tasks for today are done${act.streak > 1 ? `, streak ${act.streak} days` : ""} — keep it up.`,
          `Bugünün ${today.total} görevinin hepsi tamam${act.streak > 1 ? `, seri ${act.streak} gün` : ""} — böyle devam.`,
          `Бүгінгі ${today.total} тапсырманың бәрі орындалды${act.streak > 1 ? `, серия ${act.streak} күн` : ""} — осылай жалғастырамыз.`,
        );
      }
      const done = today?.done ?? 0;
      const total = today?.total ?? 0;
      return t(
        `Сегодня ${done} из ${total || "—"} заданий. Начни с одного — даже 10 минут двигают к цели.`,
        `Today: ${done} of ${total || "—"} tasks. Start with one — even 10 minutes move you forward.`,
        `Bugün ${total || "—"} görevden ${done} tamam. Bir tanesiyle başla — 10 dakika bile ileri taşır.`,
        `Бүгін ${total || "—"} тапсырманың ${done}-і орындалды. Біреуінен баста — 10 минуттың өзі алға жылжытады.`,
      );
    }
  }
}
