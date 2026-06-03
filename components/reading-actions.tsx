"use client";

import { Download, Heart, Share2, X } from "lucide-react";
import { useState } from "react";

type Quote = { text: string; author: string; source: string };

const SITE = "xiaoman-lime.vercel.app";
const SITE_URL = "https://xiaoman-lime.vercel.app";

export function ReadingActions({ reading, quote }: { reading: string; quote: Quote }) {
  const [poster, setPoster] = useState<string | null>(null); // dataURL for the overlay
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function makeBlob(): Promise<{ blob: Blob; dataUrl: string } | null> {
    const dataUrl = drawPoster(reading, quote);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return { blob, dataUrl };
  }

  async function onSave() {
    if (busy) return;
    setBusy(true);
    try {
      const made = await makeBlob();
      if (made) setPoster(made.dataUrl); // overlay → 长按保存
    } catch {
      flash("生成失败，再试一次");
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    if (busy) return;
    setBusy(true);
    try {
      const made = await makeBlob();
      if (!made) throw new Error("no-image");
      const file = new File([made.blob], "xiaoman.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          text: `${quote.text} —— ${quote.author}${quote.source}（来自小满 · ${SITE}）`,
          url: SITE_URL
        });
      } else if (nav.share) {
        await nav.share({
          text: `${quote.text} —— ${quote.author}${quote.source}`,
          url: SITE_URL
        });
      } else {
        // no native share → show poster so they can long-press / screenshot
        setPoster(made.dataUrl);
        flash("长按图片保存，再分享到微信/朋友圈");
      }
    } catch {
      // user cancelled or unsupported — non-fatal
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-7 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={busy}
          className="flex h-[48px] items-center justify-center gap-2 rounded-full border border-white/70 bg-[rgba(255,251,243,0.8)] text-[14px] font-medium text-primary shadow-[var(--card-shadow)] backdrop-blur-xl transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          <Heart className="h-4 w-4 text-[var(--accent-coral)]" strokeWidth={1.8} />
          留住这一刻
        </button>
        <button
          type="button"
          onClick={() => void onShare()}
          disabled={busy}
          className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--btn-dark)] text-[14px] font-medium text-white shadow-[0_8px_18px_rgba(42,37,32,0.18)] transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.8} />
          分享给懂的人
        </button>
      </div>

      {/* poster overlay — long-press to save on iOS, or download on Android */}
      {poster ? (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[rgba(42,37,32,0.7)] px-6 backdrop-blur-sm">
          <button
            type="button"
            aria-label="关闭"
            onClick={() => setPoster(null)}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="今日解读" className="max-h-[72vh] w-auto rounded-[14px] shadow-2xl" />
          <p className="mt-4 text-center text-[13px] text-white/90">长按图片，保存到相册</p>
          <a
            href={poster}
            download="小满-今日解读.png"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-primary"
          >
            <Download className="h-4 w-4" strokeWidth={1.8} />
            下载图片
          </a>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-[18px] bg-btn-dark px-4 py-2 text-sm text-white">
          {toast}
        </div>
      ) : null}
    </>
  );
}

/* ---------- canvas poster ---------- */
function drawPoster(reading: string, quote: Quote): string {
  const W = 1080;
  const H = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const serif = '"Songti SC", "STSong", "Noto Serif SC", serif';
  const sans = '"PingFang SC", system-ui, sans-serif';
  const pad = 110;
  const maxW = W - pad * 2;

  // background + frame
  ctx.fillStyle = "#FBF6EC";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(199,93,62,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  // eyebrow
  ctx.textAlign = "left";
  ctx.fillStyle = "#8A7E6E";
  ctx.font = `28px ${serif}`;
  ctx.fillText("今 日 解 读", pad, 150);
  // small coral rule
  ctx.fillStyle = "#C75D3E";
  ctx.fillRect(pad, 172, 60, 4);

  let y = 250;

  // distilled reading
  ctx.fillStyle = "#5b5347";
  ctx.font = `32px ${serif}`;
  y = wrap(ctx, reading, pad, y, maxW, 54);
  y += 70;

  // the quote (adaptive size)
  const qlen = quote.text.length;
  const qFont = qlen <= 20 ? 62 : qlen <= 46 ? 50 : qlen <= 82 ? 40 : 34;
  ctx.fillStyle = "#2A2520";
  ctx.font = `600 ${qFont}px ${serif}`;
  y = wrap(ctx, quote.text, pad, y, maxW, Math.round(qFont * 1.6));

  // attribution
  y += 24;
  ctx.fillStyle = "#8A5D32";
  ctx.font = `italic 30px ${serif}`;
  ctx.textAlign = "right";
  ctx.fillText(`— ${quote.author}${quote.source}`, W - pad, y + 28);
  ctx.textAlign = "left";

  // footer branding
  ctx.fillStyle = "#C75D3E";
  ctx.font = `600 46px ${serif}`;
  ctx.fillText("小满", pad, H - 150);
  ctx.fillStyle = "#8A7E6E";
  ctx.font = `26px ${serif}`;
  ctx.fillText("一个一直在听你说话的 AI 朋友", pad, H - 108);
  ctx.fillStyle = "#B8AC9A";
  ctx.font = `24px ${sans}`;
  ctx.fillText(SITE, pad, H - 66);

  return canvas.toDataURL("image/png");
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  let line = "";
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = ch;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}
