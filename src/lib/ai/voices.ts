/**
 * Voice options for the ElevenLabs speaking teacher (block C).
 *
 * Founder decision 07.07.2026: the student picks the voice in settings,
 * default is Ahu (encouraging teacher tone — the daily-use default; Fatih's
 * stricter examiner tone fits mock-exam mode). Adding a voice later = one
 * more entry here + the voice added to the ElevenLabs account.
 *
 * The chosen elevenVoiceId is passed as a conversation override when a voice
 * session starts; the student's choice lives in profiles.preferred_voice.
 */

type LocalizedText = { ru: string; en: string; tr: string; kk: string };

export type VoiceOption = {
  /** Stable slug stored in profiles.preferred_voice. */
  id: string;
  /** Voice id in the ElevenLabs account (added from the voice library). */
  elevenVoiceId: string;
  name: string;
  gender: "female" | "male";
  tone: LocalizedText;
};

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "ahu",
    elevenVoiceId: "xyqF3vGMQlPk3e7yA4DI",
    name: "Ahu",
    gender: "female",
    tone: {
      ru: "Тёплый, поддерживающий тон преподавателя",
      en: "Warm, encouraging teacher tone",
      tr: "Sıcak, cesaretlendirici öğretmen tonu",
      kk: "Жылы, қолдаушы ұстаз үні",
    },
  },
  {
    id: "gokce",
    elevenVoiceId: "oPC5I9GKjMReiaM29gjY",
    name: "Gökçe",
    gender: "female",
    tone: {
      ru: "Живой, дружелюбный",
      en: "Lively and friendly",
      tr: "Canlı ve samimi",
      kk: "Жанды, ашық-жарқын",
    },
  },
  {
    id: "fatih",
    elevenVoiceId: "7VqWGAWwo2HMrylfKrcm",
    name: "Fatih",
    gender: "male",
    tone: {
      ru: "Глубокий, чёткий — тон экзаменатора",
      en: "Deep and clear — examiner tone",
      tr: "Derin ve net — sınav görevlisi tonu",
      kk: "Терең әрі анық — емтихан алушы үні",
    },
  },
];

export const DEFAULT_VOICE_ID = "ahu";

export function voiceById(id: string | null | undefined): VoiceOption {
  return VOICE_OPTIONS.find((v) => v.id === id) ?? VOICE_OPTIONS[0];
}
