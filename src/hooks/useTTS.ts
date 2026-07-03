"use client";

import { useCallback, useEffect, useState } from "react";

/** Browser text-to-speech for Turkish audio (SpeechSynthesis API). */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [turkishVoice, setTurkishVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }
    function loadVoices() {
      const all = window.speechSynthesis.getVoices();
      setTurkishVoice(all.find((v) => v.lang.toLowerCase().startsWith("tr")) ?? null);
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string, rate = 0.85) => {
      if (!isSupported) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "tr-TR";
      u.rate = rate;
      if (turkishVoice) u.voice = turkishVoice;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [turkishVoice, isSupported],
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported, hasTurkishVoice: !!turkishVoice };
}
