/**
 * Контекст для личности Ahu — компактный блок РЕАЛЬНЫХ фактов (турецкий:
 * модель «думает» по-турецки, как во всех промптах проекта). Секции без
 * данных опускаются; жёсткий потолок MAX_CONTEXT_CHARS держит экономику
 * (бюджетное правило основателя: контекст не раздувает каждый вызов).
 *
 * Модель может ТОЛЬКО переформулировать эти строки — правило мотиватора,
 * теперь общее для всех каналов.
 */

import { topicById } from "@/lib/ai/topics";
import type { CoachChannel, CoachDecision, CoachState, StudentSnapshot } from "./types";
import { activityOf, daysBetween } from "./states";

/** ~450 токенов — потолок всего блока фактов. */
export const MAX_CONTEXT_CHARS = 1800;

const trLabel = (id: string) => topicById(id)?.label.tr ?? id;

const agoDays = (ts: string | null | undefined, today: string): number | null =>
  ts ? Math.max(0, daysBetween(ts.slice(0, 10), today)) : null;

const agoTr = (n: number | null): string =>
  n == null ? "" : n === 0 ? "bugün" : n === 1 ? "dün" : `${n} gün önce`;

/* --------------------- строка состояния + директива ---------------------- */

/** Однострочное TR-описание состояния; экспорт — голосовой роут кладёт его
 * в dynamic-переменную {{focus_reason}} ElevenLabs-агента. */
export function stateLineTr(st: CoachState): string {
  switch (st.id) {
    case "NEWBIE":
      return "YENİ ÖĞRENCİ — geçmiş günler yok, bugün ilk adım.";
    case "EXAM_SOON":
      return `SINAV YAKIN — ${st.daysToExam} gün kaldı${st.lastMockTotal != null ? `, son deneme ${st.lastMockTotal}/100` : ", henüz deneme yok"}.`;
    case "STREAK_BROKEN":
      return `ARA VERDİ — ${st.daysSinceActivity} gündür girmiyor (son aktivite ${st.lastActivityDate}).`;
    case "TOPIC_FAILED":
      return `KONU ZAYIF — «${trLabel(st.topic)}» güç ${st.strength}/100${st.recentErrors ? `, son 7 günde ${st.recentErrors} hata` : ""}.`;
    case "BEHIND":
      return st.reason === "deadline"
        ? `GERİDE — bu tempoyla sınav tarihine yetişmiyor (yük ${st.loadPct ?? "?"}%).`
        : `GERİDE — son 7 günde planın sadece %${st.weekDonePct} yapıldı.`;
    case "BREAKTHROUGH":
      return st.kind === "topic_closed"
        ? `ATILIM — «${trLabel(st.topic ?? "")}» konusu bugün kapandı: güç ${st.strength ?? 60}/100 (eşik 60). Bu bir KONU GÜCÜ puanıdır, soru sayısı değil.`
        : `ATILIM — deneme sınavı ${st.mockTotal}/100, öncekinden ${st.mockDelta} puan yukarı.`;
    case "PLATEAU":
      return `PLATO — düzenli çalışıyor ama «${trLabel(st.topic)}» (${st.strength}/100) ${st.daysSincePracticed} gündür hiç çalışılmadı.`;
    case "ON_TRACK":
      return "YOLUNDA — düzenli ilerliyor.";
  }
}

/** Директива честности под состояние — прямое наследие уроков мотиватора. */
function stateDirective(st: CoachState): string {
  switch (st.id) {
    case "NEWBIE":
      return "Öğrenci platforma DAHA YENİ başladı. 'Kaçırdın / dersi atladın / kayboldun' DEME; hoş geldin de ve SOMUT ilk adımı öner.";
    case "STREAK_BROKEN":
      return "Kaybolmayı açık ama sıcak söyle ('пропуск — бывает' ruhunda); suçlama yok, bugün küçük bir adıma çağır.";
    case "BREAKTHROUGH":
      return "Başarıyı SOMUT sayıyla kutla; genel 'aferin' yok, abartma yok.";
    case "BEHIND":
    case "EXAM_SOON":
      return "Durumu dürüstçe söyle, panik yaratma; tek somut sonraki adım ver.";
    case "TOPIC_FAILED":
    case "PLATEAU":
      return "Zayıf konuyu suçlamadan göster ve bugün onunla çalışmayı öner.";
    case "ON_TRACK":
      return "Gerçek sayılara dayan; boş övgü yok, bir sonraki somut adımı göster.";
  }
}

const ACTION_TR: Record<CoachDecision["action"], string> = {
  none: "öneri yok",
  suggest_task: "bugünkü plandaki göreve yönlendir",
  suggest_voice: "Ahu ile sesli ders öner",
  suggest_mock: "deneme TÖMER öner",
  warn_pace: "tempo/tarih ayarlarına bakmayı öner",
  celebrate: "başarıyı kutla",
};

/* --------------------------------- сборка -------------------------------- */

type Line = { text: string; /** больший = выбрасывается первым при переполнении */ dropOrder: number };

export function buildAhuContext(
  s: StudentSnapshot,
  d: CoachDecision,
  channel: CoachChannel,
): string {
  const act = activityOf(s);
  const lines: Line[] = [];
  const keep = (text: string) => lines.push({ text, dropOrder: 0 });
  const opt = (text: string, dropOrder: number) => lines.push({ text, dropOrder });

  // — студент и цель (всегда)
  keep(
    `ÖĞRENCİ: ${s.name ?? "öğrenci"}${s.gender ? (s.gender === "female" ? ", kadın" : ", erkek") : ""}, seviye ${s.level} → hedef ${s.targetLevel}, ${s.daysToExam != null ? `sınava ${s.daysToExam} gün` : "sınav tarihi belirlenmedi"}.`,
  );

  // — состояние + директива (всегда)
  keep(`DURUM: ${stateLineTr(d.state)}`);
  for (const st of d.states.slice(1, 3)) opt(`AYRICA: ${stateLineTr(st)}`, 3);
  keep(`DAVRANIŞ: ${stateDirective(d.state)}`);

  // — план и активность
  const planBits: string[] = [];
  if (s.routeWeek) planBits.push(`hafta ${s.routeWeek.index}/${s.routeWeek.total} «${s.routeWeek.themeTr}»`);
  if (act.todayPlan) planBits.push(`bugün ${act.todayPlan.done}/${act.todayPlan.total} görev`);
  else planBits.push("bugünkü plan henüz açılmadı");
  if (s.minutesDaily) planBits.push(`tempo ${s.minutesDaily} dk/gün`);
  if (act.streak > 0) planBits.push(`seri ${act.streak} gün`);
  if (s.feasibility && s.feasibility.verdict !== "unknown") {
    const v = { ok: "yetişiyor", tight: "sıkışık", notEnough: "yetişmiyor" }[s.feasibility.verdict];
    planBits.push(`gidişat: ${v}${s.feasibility.loadPct != null ? ` (%${s.feasibility.loadPct} yük)` : ""}`);
  }
  keep(`PLAN: ${planBits.join(", ")}.`);
  if (act.yesterdayPlan) opt(`DÜN: ${act.yesterdayPlan.done}/${act.yesterdayPlan.total} görev.`, 2);
  if (s.topicsClosed > 0) opt(`KAPANAN KONULAR: ${s.topicsClosed}.`, 2);

  // — слабые темы (топ-3)
  const weak = s.topics.filter((t) => t.topic !== "other" && t.strength < 60).slice(0, 3);
  if (weak.length) {
    opt(
      `ZAYIF KONULAR (güç 0-100): ${weak.map((t) => `${trLabel(t.topic)} — güç ${t.strength}${t.errorCount ? `, ${t.errorCount} hata` : ""}`).join("; ")}.`,
      1,
    );
  }

  // — свежие ошибки (топ-3): чат ссылается на РЕАЛЬНЫЕ ошибки студента
  for (const e of s.recentErrors.slice(0, 3)) {
    opt(`HATA (${agoTr(agoDays(e.createdAt, s.today))}, ${e.source}): «${e.quote}» → «${e.correction}» [${trLabel(e.topic)}]`, 4);
  }

  // — последний голосовой урок и mock
  if (s.lastVoice?.endedAt) {
    opt(
      `SON SESLİ DERS (${agoTr(agoDays(s.lastVoice.endedAt, s.today))}, ${s.lastVoice.minutes} dk): ${
        s.lastVoice.topicsWorked.length ? s.lastVoice.topicsWorked.map(trLabel).join(", ") : "konu kaydı yok"
      }${s.lastVoice.errorCount ? `, ${s.lastVoice.errorCount} hata` : ", hatasız"}${
        s.lastVoice.criteriaTotal != null ? `, değerlendirme ${s.lastVoice.criteriaTotal}/20` : ""
      }.`,
      5,
    );
  }
  if (s.lastMock?.total != null) {
    const delta =
      s.prevMock?.total != null ? ` (önceki ${s.prevMock.total}, ${s.lastMock.total - s.prevMock.total >= 0 ? "+" : ""}${s.lastMock.total - s.prevMock.total})` : "";
    opt(`SON DENEME (${agoTr(agoDays(s.lastMock.createdAt, s.today))}): ${s.lastMock.total}/100${delta}.`, 5);
  }

  // — решение ядра (всегда)
  keep(
    `KARAR: odak = ${d.focusTopics.length ? d.focusTopics.map(trLabel).join(", ") : "genel tekrar"}; öneri = ${ACTION_TR[d.action]}${d.replanHint ? "; rota yenilemeyi düşün" : ""}.`,
  );

  // — канальная инструкция (всегда)
  keep(
    channel === "proactive"
      ? "Bu verilerden panele BUGÜNKÜ kısa notunu yaz."
      : channel === "chat"
        ? "Bu blok SADECE arka plan bilgisi. Öğrencinin mesajına cevap ver; bağlamı yeri geldiğinde doğal kullan, her cevapta rapor okuma."
        : "Bu blok sesli ders bağlamıdır.",
  );

  // потолок: выбрасываем опциональные строки, начиная с самых расходных
  let result = lines.map((l) => l.text).join("\n");
  const droppable = [...lines].filter((l) => l.dropOrder > 0).sort((a, b) => b.dropOrder - a.dropOrder);
  for (const drop of droppable) {
    if (result.length <= MAX_CONTEXT_CHARS) break;
    const i = lines.indexOf(drop);
    if (i !== -1) lines.splice(i, 1);
    result = lines.map((l) => l.text).join("\n");
  }
  // страховка: обязательные строки длиннее потолка не бывают по построению,
  // но чужой ввод (имя/цитаты) капим жёстко
  return result.length > MAX_CONTEXT_CHARS ? result.slice(0, MAX_CONTEXT_CHARS) : result;
}
