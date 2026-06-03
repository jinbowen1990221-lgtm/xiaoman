"use client";

import { Heart, Share2, X } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";

type Quote = { text: string; author: string; source: string };

const SITE = "xiaoman-lime.vercel.app";
const SITE_URL = "https://xiaoman-lime.vercel.app";

export function ReadingActions({ reading, quote }: { reading: string; quote: Quote }) {
  const [poster, setPoster] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function makePoster() {
    const dataUrl = await drawPoster(reading, quote);
    const blob = await (await fetch(dataUrl)).blob();
    return { dataUrl, blob };
  }

  // 留住这一刻 → open the popup with one action: save to album
  async function openSave() {
    if (busy) return;
    setBusy(true);
    try {
      setPoster(await makePoster());
    } catch {
      flash("生成失败，再试一次");
    } finally {
      setBusy(false);
    }
  }

  // 分享给懂的人 → straight to the system share sheet (no custom popup)
  async function systemShare() {
    if (busy) return;
    setBusy(true);
    try {
      const made = await makePoster();
      const file = new File([made.blob], "小满-今日解读.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          text: `${quote.text} —— ${quote.author}${quote.source}（来自小满 · ${SITE}）`
        });
      } else if (nav.share) {
        await nav.share({ text: `${quote.text} —— ${quote.author}${quote.source}`, url: SITE_URL });
      } else {
        setPoster(made); // no native share → let them save instead
        flash("长按图片保存后再分享");
      }
    } catch {
      // user cancelled — ignore
    } finally {
      setBusy(false);
    }
  }

  // save the poster: on iOS the share sheet's “存储图像” drops it into Photos
  async function saveToAlbum() {
    if (!poster) return;
    const file = new File([poster.blob], "小满-今日解读.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    try {
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = poster.dataUrl;
        a.download = "小满-今日解读.png";
        a.click();
      }
    } catch {
      // cancelled — ignore
    }
  }

  return (
    <>
      <div className="mt-7 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void openSave()}
          disabled={busy}
          className="flex h-[48px] items-center justify-center gap-2 rounded-full border border-white/70 bg-[rgba(255,251,243,0.8)] text-[14px] font-medium text-primary shadow-[var(--card-shadow)] backdrop-blur-xl transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          <Heart className="h-4 w-4 text-[var(--accent-coral)]" strokeWidth={1.8} />
          {busy ? "生成中…" : "留住这一刻"}
        </button>
        <button
          type="button"
          onClick={() => void systemShare()}
          disabled={busy}
          className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--btn-dark)] text-[14px] font-medium text-white shadow-[0_8px_18px_rgba(42,37,32,0.18)] transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.8} />
          分享给懂的人
        </button>
      </div>

      {/* save popup — single action */}
      {poster ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(42,37,32,0.72)] backdrop-blur-sm">
          <button type="button" aria-label="关闭" onClick={() => setPoster(null)} className="absolute inset-0" />
          <div
            className="relative mx-3 mb-3 w-full max-w-app rounded-[26px] bg-[rgba(255,251,243,0.98)] px-5 pb-6 pt-5 shadow-[0_-10px_40px_rgba(0,0,0,0.25)]"
            style={{ marginBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={() => setPoster(null)}
              aria-label="关闭"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/5 text-secondary"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster.dataUrl}
              alt="今日解读"
              className="mx-auto max-h-[58vh] w-auto rounded-[14px] shadow-[0_10px_30px_rgba(120,80,40,0.25)]"
            />
            <p className="mt-3 text-center font-garamond text-[12px] italic text-tertiary">
              长按图片，可直接存到相册
            </p>

            <button
              type="button"
              onClick={() => void saveToAlbum()}
              className="bob-button-dark mt-3 h-[50px] w-full text-[15px]"
            >
              保存到相册
            </button>
          </div>
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
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function drawPoster(reading: string, quote: Quote): Promise<string> {
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

  ctx.fillStyle = "#FBF6EC";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(199,93,62,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, W - 88, H - 88);

  ctx.textAlign = "left";
  ctx.fillStyle = "#8A7E6E";
  ctx.font = `28px ${serif}`;
  ctx.fillText("今 日 解 读", pad, 150);
  ctx.fillStyle = "#C75D3E";
  ctx.fillRect(pad, 172, 60, 4);

  let y = 248;
  ctx.fillStyle = "#5b5347";
  ctx.font = `32px ${serif}`;
  y = wrap(ctx, reading, pad, y, maxW, 54);
  y += 64;

  const qlen = quote.text.length;
  const qFont = qlen <= 20 ? 60 : qlen <= 46 ? 50 : qlen <= 82 ? 40 : 34;
  ctx.fillStyle = "#2A2520";
  ctx.font = `600 ${qFont}px ${serif}`;
  y = wrap(ctx, quote.text, pad, y, maxW, Math.round(qFont * 1.6));

  y += 24;
  ctx.fillStyle = "#8A5D32";
  ctx.font = `italic 30px ${serif}`;
  ctx.textAlign = "right";
  ctx.fillText(`— ${quote.author}${quote.source}`, W - pad, y + 28);
  ctx.textAlign = "left";

  /* ----- footer: brand (icon + text) left, QR right — all inside the frame ----- */
  const footTop = H - 220;

  // brand icon + text to its right
  try {
    const icon = await loadImage("/icon-192.png");
    const s = 92;
    ctx.save();
    roundRectPath(ctx, pad, footTop, s, s, 20);
    ctx.clip();
    ctx.drawImage(icon, pad, footTop, s, s);
    ctx.restore();
    const tx = pad + s + 22;
    ctx.fillStyle = "#C75D3E";
    ctx.font = `600 40px ${serif}`;
    ctx.fillText("小满", tx, footTop + 40);
    ctx.fillStyle = "#8A7E6E";
    ctx.font = `24px ${serif}`;
    ctx.fillText("一个一直在听你说话的 AI 朋友", tx, footTop + 78);
    ctx.fillStyle = "#B8AC9A";
    ctx.font = `22px ${sans}`;
    ctx.fillText(SITE, tx, footTop + 110);
  } catch {
    ctx.fillStyle = "#C75D3E";
    ctx.font = `600 40px ${serif}`;
    ctx.fillText("小满", pad, footTop + 50);
  }

  // QR + caption, kept inside the frame (frame bottom is H-44)
  try {
    const qrUrl = await QRCode.toDataURL(SITE_URL, {
      margin: 1,
      width: 240,
      color: { dark: "#2A2520", light: "#FBF6EC" }
    });
    const qr = await loadImage(qrUrl);
    const qs = 132;
    const qx = W - pad - qs;
    const qy = footTop - 6;
    ctx.drawImage(qr, qx, qy, qs, qs);
    ctx.fillStyle = "#B8AC9A";
    ctx.font = `22px ${sans}`;
    ctx.textAlign = "center";
    ctx.fillText("扫码遇见小满", qx + qs / 2, qy + qs + 26);
    ctx.textAlign = "left";
  } catch {
    // QR optional
  }

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
