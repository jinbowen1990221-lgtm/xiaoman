"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FixedFooter } from "@/components/onboarding/fixed-footer";
import { TopNav } from "@/components/top-nav";
import { WheelColumn } from "@/components/onboarding/wheel-column";
import { saveOnboarding } from "@/lib/onboarding-client";
import type { BirthdayType } from "@/lib/user-types";

export function BirthdayForm({
  initialBirthday,
  initialType
}: {
  initialBirthday: string | null;
  initialType: BirthdayType;
}) {
  const router = useRouter();
  const now = new Date();
  const parsed = initialBirthday?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const [year, setYear] = useState(parsed ? Number(parsed[1]) : now.getFullYear() - 25);
  const [month, setMonth] = useState(parsed ? Number(parsed[2]) : now.getMonth() + 1);
  const [day, setDay] = useState(parsed ? Number(parsed[3]) : now.getDate());
  const [birthdayType, setBirthdayType] = useState<BirthdayType>(initialType ?? "solar");
  const [saving, setSaving] = useState(false);

  const years = useMemo(
    () => Array.from({ length: 81 }, (_, i) => now.getFullYear() - 80 + i),
    [now]
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  async function submit() {
    if (saving) return;
    setSaving(true);
    const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    try {
      await saveOnboarding({ birthday: value, birthday_type: birthdayType });
      router.replace("/");
      router.refresh();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="secondary-page-pad relative z-10 min-h-dvh pb-28">
      <TopNav title="设置生日" backHref="/me" />

      <section className="stagger-in mt-2">
        <p className="eyebrow">BIRTHDAY · 你的生日</p>
        <h1 className="mt-3 font-serif text-[28px] font-medium leading-tight text-primary">
          填上<span className="text-[var(--accent-coral)]">生日</span>，解锁你的幸运号
        </h1>
        <p className="mt-3 text-[14px] font-light leading-6 text-secondary">
          幸运号会根据你的生日 + 当周生成，每周一刷新。也方便小满在你生日那天第一个跟你说。
        </p>

        <div className="mt-6 inline-flex gap-2 rounded-full bg-[rgba(255,251,243,0.66)] p-1 backdrop-blur-xl">
          {(["solar", "lunar"] as BirthdayType[]).map((type) => {
            const active = birthdayType === type;
            return (
              <button
                type="button"
                key={type}
                onClick={() => setBirthdayType(type)}
                className={`rounded-full px-5 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "bg-[var(--btn-dark)] text-white shadow-[0_4px_10px_rgba(42,37,32,0.16)]"
                    : "text-secondary"
                }`}
              >
                {type === "solar" ? "阳历" : "农历"}
              </button>
            );
          })}
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)] backdrop-blur-xl">
          <div className="flex gap-4">
            <WheelColumn label="年" values={years} value={year} onChange={setYear} />
            <WheelColumn label="月" values={months} value={month} onChange={setMonth} />
            <WheelColumn label="日" values={days} value={day} onChange={setDay} />
          </div>
        </div>

        <p className="mt-3 text-center font-garamond text-[12px] italic text-tertiary">
          — {birthdayType === "solar" ? "阳历" : "农历"}　{year} · {month} · {day} —
        </p>
      </section>

      <FixedFooter>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="bob-button-dark w-full disabled:opacity-60"
        >
          {saving ? "正在保存…" : "保存，生成我的幸运号"}
        </button>
      </FixedFooter>
    </div>
  );
}
