"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Mic, Square, X } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { StarMascot } from "@/components/decorative/StarMascot";
import { useAudioLevel } from "@/hooks/useAudioLevel";
import { createSpeechRecognition } from "@/lib/speech";

type InputMode = "text" | "voice";
type VoiceState = "idle" | "recording" | "recorded";

const speech = createSpeechRecognition();

export function RecordComposer() {
  const [mode, setMode] = useState<InputMode>("text");
  const [images, setImages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [reflection, setReflection] = useState<{ line: string; question: string } | null>(null);
  const [toast, setToast] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const levels = useAudioLevel(voiceState === "recording");

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (voiceState !== "recording") {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setDuration((current) => current + 1);
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [voiceState]);

  const spokenText = useMemo(
    () => [finalTranscript, interimTranscript].filter(Boolean).join(finalTranscript && interimTranscript ? "" : ""),
    [finalTranscript, interimTranscript]
  );
  const canSubmit = mode === "text" ? text.trim().length > 0 || images.length > 0 : spokenText.trim().length > 0 || images.length > 0;

  function pickImages() {
    if (images.length >= 3) return;
    fileInputRef.current?.click();
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // let the user re-pick the same photo later
    if (!files.length) return;
    const room = Math.max(0, 3 - images.length);
    const chosen = files.slice(0, room);
    const dataUrls = await Promise.all(chosen.map(readAsDataUrl));
    setImages((current) => [...current, ...dataUrls].slice(0, 3));
  }

  function changeMode(nextMode: InputMode) {
    if (nextMode === "voice" && !speech.isSupported()) {
      setToast("你的浏览器暂时不支持语音，先用打字吧");
      setMode("text");
      return;
    }
    setMode(nextMode);
  }

  function startRecording(append = false) {
    setPermissionError("");
    setSaved(false);
    if (!append) {
      setFinalTranscript("");
      setInterimTranscript("");
      setDuration(0);
    }
    setVoiceState("recording");
    speech.start(
      (interim) => setInterimTranscript(interim),
      (finalText) => {
        setFinalTranscript((current) => `${current}${finalText}`);
        setInterimTranscript("");
      },
      (error) => {
        setVoiceState("idle");
        setInterimTranscript("");
        if (error.message === "not-allowed" || error.message === "service-not-allowed") {
          setPermissionError("需要麦克风权限才能听你说话");
          return;
        }
        if (error.message === "unsupported") {
          setToast("你的浏览器暂时不支持语音，先用打字吧");
          setMode("text");
          return;
        }
        setToast("刚刚没听清，我们再来一次");
      }
    );
  }

  function stopRecording() {
    speech.stop();
    setInterimTranscript("");
    setVoiceState("recorded");
  }

  function resetVoice() {
    speech.stop();
    setPermissionError("");
    setFinalTranscript("");
    setInterimTranscript("");
    setDuration(0);
    setVoiceState("idle");
  }

  async function submit() {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setSaved(false);
    const body =
      mode === "text"
        ? {
            content: text.trim(),
            images,
            input_type: "text",
            audio_duration: null
          }
        : {
            content: spokenText.trim(),
            images,
            input_type: "voice",
            audio_duration: duration
          };

    const savedContent = body.content;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      window.clearTimeout(timeout);
      if (!res.ok) throw new Error("save-failed");
      setSaved(true);
      setReflection(null);
      if (mode === "text") setText("");
      // 小满's gentle reflection on what was just written
      void fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: savedContent })
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { line?: string; question?: string } | null) => {
          if (data?.line) setReflection({ line: data.line, question: data.question ?? "" });
        })
        .catch(() => undefined);
    } catch {
      window.clearTimeout(timeout);
      setToast("没收住，等一下再交给我？");
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearAll() {
    setText("");
    setImages([]);
    setSaved(false);
    resetVoice();
  }

  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center gap-2">
        {(["text", "voice"] as InputMode[]).map((item) => {
          const active = mode === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => changeMode(item)}
              className={`rounded-[20px] px-5 py-2 text-[13px] font-medium transition-colors duration-200 ${
                active ? "bg-[#2C2824] text-white" : "bg-card text-primary"
              }`}
            >
              {item === "text" ? "打字" : "说话"}
            </button>
          );
        })}
      </div>
      <section className="glass-card min-h-[180px] p-5">
        <AnimatePresence mode="wait">
          {mode === "text" ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                inputMode="text"
                className="min-h-[120px] w-full border-0 bg-transparent text-[15px] leading-[1.7] text-primary outline-none placeholder:text-tertiary"
                placeholder="从哪里开始都可以。"
              />
            </motion.div>
          ) : (
            <motion.div
              key="voice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex min-h-[216px] flex-col items-center justify-center"
            >
              {permissionError ? (
                <div className="text-center">
                  <p className="text-base font-medium text-accent">{permissionError}</p>
                  <button type="button" className="mt-3 text-sm text-secondary underline underline-offset-4">
                    去设置里打开 →
                  </button>
                </div>
              ) : (
                <>
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (voiceState === "recording") stopRecording();
                      else startRecording(voiceState === "recorded");
                    }}
                    animate={voiceState === "recording" ? { scale: [0.95, 1.05, 0.95] } : { scale: 1 }}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: voiceState === "recording" ? Number.POSITIVE_INFINITY : 0
                    }}
                    className="relative grid h-[120px] w-[120px] place-items-center rounded-full"
                    style={{ background: "rgba(240,230,210,0.9)" }}
                  >
                    <span className="absolute grid h-24 w-24 place-items-center rounded-full" style={{ background: "rgba(196,163,90,0.18)" }} />
                    <span className="absolute grid h-[72px] w-[72px] place-items-center rounded-full bg-accent text-white shadow-[0_12px_24px_rgba(168,74,58,0.18)]">
                      {voiceState === "recording" ? <Square size={24} fill="currentColor" /> : <Mic size={28} />}
                    </span>
                  </motion.button>
                  <p className="mt-5 text-[15px] font-medium text-accent">
                    {voiceState === "idle"
                      ? "点一下，我听着"
                      : voiceState === "recording"
                        ? `正在听 · ${formatDuration(duration)}`
                        : `录了 ${formatDuration(duration)}，可以重录或加内容`}
                  </p>

                  <div className="mt-4 flex h-5 items-end gap-[3px]">
                    {levels.map((level, index) => (
                      <span
                        key={index}
                        className="w-0.5 rounded-[1px] bg-accent"
                        style={{ height: `${6 + level * 14}px` }}
                      />
                    ))}
                  </div>

                  {voiceState === "recorded" ? (
                    <div className="mt-5 grid w-full grid-cols-2 gap-2.5">
                      <button type="button" onClick={resetVoice} className="glass-card h-10 rounded-[18px] text-sm text-primary">
                        重新录
                      </button>
                      <button
                        type="button"
                        onClick={() => startRecording(true)}
                        className="glass-card h-10 rounded-[18px] text-sm text-accent"
                      >
                        继续说
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-5 w-full rounded-[18px] bg-card-deep px-4 py-3">
                    <p className="text-[11px] tracking-[1px] text-secondary">
                      实时转写{voiceState === "recorded" ? " · 可以改" : ""}
                    </p>
                    {voiceState === "recording" ? (
                      <div className="mt-2 min-h-20 max-h-40 overflow-y-auto text-sm leading-[1.6] text-primary">
                        {spokenText ? (
                          <span>
                            {finalTranscript}
                            {interimTranscript ? (
                              <span className="text-secondary">{interimTranscript}...</span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-tertiary">想到什么说什么。不完整也没事。</span>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={finalTranscript}
                        onChange={(event) => setFinalTranscript(event.target.value)}
                        className="mt-2 min-h-20 max-h-40 w-full resize-none overflow-y-auto border-0 bg-transparent text-sm leading-[1.6] text-primary outline-none placeholder:text-tertiary"
                        placeholder="想到什么说什么。录完也可以在这里改。"
                      />
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
              aria-label={`删除照片 ${index + 1}`}
              className="relative h-12 w-12 overflow-hidden rounded-[18px] border border-black/5 bg-card-deep"
            >
              {image.startsWith("data:") || image.startsWith("blob:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-xs text-secondary">
                  {image}
                </span>
              )}
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-card">
                <X size={10} />
              </span>
            </button>
          ))}
          {images.length < 3 ? (
            <button
              type="button"
              onClick={pickImages}
              className="glass-card grid h-12 w-12 place-items-center rounded-[18px] border border-dashed border-border-glass-strong text-tertiary"
              aria-label="从相册添加照片"
            >
              <ImagePlus size={18} strokeWidth={1.4} />
              <span className="sr-only">从相册添加照片</span>
            </button>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleFiles(event)}
          />
        </div>
        {mode === "text" ? (
          <div className="mt-3 flex items-end justify-between">
            <div />
            <span className="text-[11px] text-tertiary">{text.length}/500</span>
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={clearAll} className="bob-button-light">
          取消
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!canSubmit || isSubmitting}
          className="bob-button-dark disabled:opacity-40"
        >
          {isSubmitting ? "小满在收下…" : "说完了"}
        </button>
      </div>

      <AnimatePresence>
        {saved ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-[18px] border border-white/70 bg-[rgba(255,247,238,0.7)] px-4 py-3.5 shadow-[var(--card-shadow)] backdrop-blur-xl"
          >
            <div className="mt-0.5 shrink-0">
              <StarMascot size={34} />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-[14px] font-medium leading-[1.6] text-primary">
                {reflection ? reflection.line : "小满收下了，放进心里了。"}
              </p>
              {reflection?.question ? (
                <p className="mt-1 font-garamond text-[13px] italic leading-[1.6] text-[var(--accent-coral)]">
                  {reflection.question}
                </p>
              ) : null}
              <p className="mt-1.5 font-garamond text-[11px] italic text-secondary">
                明天这个点，我跟你说说我注意到的。
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-[18px] bg-btn-dark px-4 py-2 text-sm text-white"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

async function readAsDataUrl(file: File): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
  // Phone photos are several MB. Downscale to a small JPEG so the request body
  // stays well under serverless limits and the upload feels instant.
  return downscaleImage(raw, 1024, 0.72);
}

function downscaleImage(dataUrl: string, maxEdge: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
