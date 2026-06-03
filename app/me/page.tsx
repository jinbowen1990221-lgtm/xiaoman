import { ChevronRight, Heart, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CompanionCard } from "@/components/companion-card";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";
import { getRecordsForUser } from "@/lib/mock-user-db";
import { maskPhone } from "@/lib/phone";

const lifestyleLabels: Record<string, string> = {
  working: "在上班",
  freelance: "自由职业 / 做自己的事",
  studying: "在读书",
  uncertain: "暂时不确定"
};

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const nickname = user.nickname ?? "朋友";
  const initial = nickname.slice(0, 1);

  // real stats from stored records
  const stored = await getRecordsForUser(user.id);
  const memories = stored.length;
  const recordDays = new Set(
    stored.map((r) => new Date(r.created_at).toDateString())
  ).size;
  const companionDays = Math.max(
    1,
    Math.ceil((Date.now() - new Date(user.created_at).getTime()) / 86400000)
  );

  return (
    <div className="stagger-in relative z-10 pb-28">
      <header className="flex items-start justify-between gap-5 px-6 pt-4">
        <div className="min-w-0">
          <p className="eyebrow">PROFILE · 关于你</p>
          <h1 className="mt-3 font-serif text-[30px] font-medium leading-tight text-primary">
            <span className="ink-underline">我的</span>
          </h1>
          <p className="mt-3 text-[14px] font-light leading-6 text-secondary">
            小满记住了你 <span className="font-serif text-[15px] text-[var(--accent-coral)]">{memories}</span> 件事
          </p>
        </div>
        <Link
          href="/settings"
          aria-label="设置"
          className="grid h-[44px] w-[44px] place-items-center rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] shadow-[var(--card-shadow)] backdrop-blur-xl transition-transform hover:scale-105"
        >
          <Settings className="h-5 w-5 text-secondary" strokeWidth={1.6} />
        </Link>
      </header>

      {/* Identity card */}
      <section className="relative mx-6 mt-[26px] overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] px-6 py-6 shadow-[var(--card-shadow)] backdrop-blur-xl">
        <div className="relative flex items-center gap-5">
          <div className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-full bg-white/65 font-serif text-[26px] text-[var(--accent-coral)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.72)]">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-[22px] font-medium text-primary truncate">{nickname}</h2>
            <div className="mt-1.5 flex items-center gap-2 text-[12px] font-light text-secondary">
              <span>{user.birthday ?? "生日还没告诉我"}</span>
              <span className="opacity-60">·</span>
              <span>{maskPhone(user.phone)}</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(199,93,62,0.20)] bg-white/45 px-2.5 py-1 text-[11px] text-[var(--accent-deep)]">
              <Heart className="h-3 w-3 fill-[var(--accent-coral)] text-[var(--accent-coral)]" strokeWidth={1.2} />
              <span>已陪伴 {companionDays} 天</span>
            </div>
          </div>
        </div>
      </section>

      {/* prominent: guide to add 小满 to the home screen */}
      <CompanionCard />

      <Section
        eyebrow="SETTINGS · 和小满有关的设置"
        items={[
          ["昵称", nickname],
          ["生日", user.birthday ? `${user.birthday} · ${user.birthday_type === "lunar" ? "农历" : "阳历"}` : "还没告诉过我"],
          ["手机号", maskPhone(user.phone)]
        ]}
      />

      <Section
        eyebrow="RHYTHM · 记录偏好"
        items={[
          ["生活节奏", user.lifestyle ? lifestyleLabels[user.lifestyle] : "还没告诉过我"],
          ["每日提醒时间", user.remind_enabled ? user.remind_time ?? "22:00" : "未开启"],
          ["最近在想的事", user.initial_thought || "还没告诉过我"]
        ]}
      />

      <Section
        eyebrow="MEMORY · 数据与记忆"
        items={[
          ["共记录了", `${recordDays} 天`],
          ["小满记住的", `${memories} 件事`]
        ]}
        accentRows={[0, 1]}
      />

      <Section
        eyebrow=""
        items={[["关于", "→"], ["隐私政策", "→"]]}
        linkRows={[0, 1]}
      />

      <div className="mt-8 text-center">
        <LogoutButton />
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  items,
  accentRows = [],
  linkRows = []
}: {
  eyebrow: string;
  items: [string, string][];
  accentRows?: number[];
  linkRows?: number[];
}) {
  return (
    <section className="mx-6 mt-5">
      {eyebrow ? <p className="eyebrow mb-2.5 pl-1">{eyebrow}</p> : null}
      <div className="overflow-hidden rounded-[18px] border border-white/70 bg-[var(--card-bg)] shadow-[var(--card-shadow)] backdrop-blur-xl">
        {items.map(([label, value], index) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-white/30 ${
              index !== items.length - 1 ? "border-b border-[rgba(180,150,100,0.08)]" : ""
            }`}
          >
            <span className="text-[14px] text-primary">{label}</span>
            {linkRows.includes(index) ? (
              <ChevronRight className="h-4 w-4 text-tertiary" strokeWidth={1.5} />
            ) : (
              <span
                className={`text-right text-[13px] ${
                  accentRows.includes(index)
                    ? "font-serif text-[16px] font-medium text-[var(--accent-coral)]"
                    : "font-light text-secondary"
                }`}
              >
                {value}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
