"use client";

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  MapPin,
  Sun,
  type LucideIcon
} from "lucide-react";
import { useEffect, useState } from "react";

type WeatherData = {
  city: string;
  temp: number;
  high: number;
  low: number;
  code: number;
};

const CACHE_KEY = "xiaoman:weather";
const CACHE_TTL = 30 * 60 * 1000; // 30 min — don't re-locate on every visit

// WMO weather codes → 中文 + icon (open-meteo uses the WMO code set)
function describe(code: number): { text: string; Icon: LucideIcon } {
  if (code === 0) return { text: "晴", Icon: Sun };
  if (code === 1 || code === 2) return { text: "多云", Icon: CloudSun };
  if (code === 3) return { text: "阴", Icon: Cloud };
  if (code === 45 || code === 48) return { text: "雾", Icon: CloudFog };
  if (code >= 51 && code <= 57) return { text: "小雨", Icon: CloudDrizzle };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return { text: "雨", Icon: CloudRain };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { text: "雪", Icon: CloudSnow };
  if (code >= 95) return { text: "雷阵雨", Icon: CloudLightning };
  return { text: "多云", Icon: CloudSun };
}

function loadCache(): WeatherData | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts?: number; data?: WeatherData };
    if (!parsed?.data || !parsed.ts) return null;
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function saveCache(data: WeatherData) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore
  }
}

export function HomeWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mode, setMode] = useState<"idle" | "loading">("idle");

  // On mount: use fresh cache; else, if location was ALREADY granted, fetch
  // silently (no tap, no prompt). Only when permission is undecided do we keep
  // the tap-to-enable chip — so a surprise dialog can't steal the first tap.
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setWeather(cached);
      return undefined;
    }
    let cancelled = false;
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    if (perms?.query) {
      perms
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (!cancelled && status.state === "granted") requestWeather();
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
    // requestWeather is stable for our purposes; run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function requestWeather() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setMode("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const [w, geo] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
            ).then((r) => r.json()),
            fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
            )
              .then((r) => r.json())
              .catch(() => null)
          ]);
          const data: WeatherData = {
            city:
              (geo?.city || geo?.locality || geo?.principalSubdivision || "")
                .toString()
                .replace(/(市|特别行政区)$/, "") || "你所在地",
            temp: Math.round(Number(w?.current?.temperature_2m ?? 0)),
            high: Math.round(Number(w?.daily?.temperature_2m_max?.[0] ?? 0)),
            low: Math.round(Number(w?.daily?.temperature_2m_min?.[0] ?? 0)),
            code: Number(w?.current?.weather_code ?? 1)
          };
          setWeather(data);
          saveCache(data);
        } catch {
          // leave the tap-to-enable chip in place so the user can retry
        } finally {
          setMode("idle");
        }
      },
      () => setMode("idle"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 30 * 60 * 1000 }
    );
  }

  // Not yet loaded → a small tappable chip. No automatic permission prompt.
  if (!weather) {
    return (
      <button
        type="button"
        onClick={requestWeather}
        disabled={mode === "loading"}
        className="flex h-[68px] shrink-0 items-center gap-2 rounded-[28px] border border-white/70 bg-[rgba(255,251,243,0.66)] px-4 text-secondary shadow-[var(--card-shadow)] backdrop-blur-xl"
        aria-label="查看天气"
      >
        <MapPin className="h-5 w-5 shrink-0 text-[var(--accent-amber)]" strokeWidth={1.7} />
        <span className="text-[13px] font-light leading-tight">
          {mode === "loading" ? "定位中…" : "看天气"}
        </span>
      </button>
    );
  }

  const { text, Icon } = describe(weather.code);
  return (
    <div className="flex h-[68px] shrink-0 items-center gap-3 whitespace-nowrap rounded-[28px] border border-white/70 bg-[rgba(255,251,243,0.66)] px-4 shadow-[var(--card-shadow)] backdrop-blur-xl">
      <Icon className="h-7 w-7 shrink-0 text-[var(--accent-amber)]" strokeWidth={1.7} />
      <span className="shrink-0 text-[22px] font-medium leading-none text-primary">
        {weather.temp}°
      </span>
      <div className="shrink-0">
        <p className="text-[15px] font-light leading-none text-primary">{weather.city}</p>
        <p className="mt-2 text-[12px] font-light leading-none text-secondary">
          {text} {weather.high}°/{weather.low}°
        </p>
      </div>
    </div>
  );
}
