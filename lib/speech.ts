export interface SpeechRecognitionService {
  isSupported: () => boolean;
  start: (
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (error: Error) => void
  ) => void;
  stop: () => void;
}

type BrowserSpeechRecognition = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onerror: ((event: { error?: string }) => void) | null;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{
          isFinal: boolean;
          0: { transcript: string };
          length: number;
        }>;
      }) => void)
    | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognition;
    webkitSpeechRecognition?: BrowserSpeechRecognition;
  }
}

export function createSpeechRecognition(): SpeechRecognitionService {
  let recognition: SpeechRecognitionInstance | null = null;

  function getConstructor() {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  }

  return {
    isSupported() {
      return Boolean(getConstructor());
    },
    start(onInterim, onFinal, onError) {
      const Recognition = getConstructor();
      if (!Recognition) {
        onError(new Error("unsupported"));
        return;
      }

      recognition?.stop();
      recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "zh-CN";
      recognition.onerror = (event) => {
        onError(new Error(event.error ?? "speech_error"));
      };
      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const phrase = event.results[index]?.[0]?.transcript ?? "";
          if (event.results[index]?.isFinal) final += phrase;
          else interim += phrase;
        }
        if (interim) onInterim(interim.trim());
        if (final) onFinal(final.trim());
      };
      recognition.start();
    },
    stop() {
      recognition?.stop();
      recognition = null;
    }
  };
}
