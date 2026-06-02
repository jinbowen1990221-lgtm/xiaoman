import { ArrowLeft, Bell, ChevronRight, FileText, Globe2, Lock, Moon, Palette, Shield, Sparkles, Trash2, Volume2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="stagger-in relative z-10 pb-16">
      <div className="flex h-14 items-center justify-between px-5 pt-2">
        <Link
          href="/me"
          aria-label="返回"
          className="grid h-[40px] w-[40px] place-items-center rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary shadow-[var(--card-shadow)] backdrop-blur-xl"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.6} />
        </Link>
        <h1 className="font-serif text-[16px] font-medium text-primary">设置</h1>
        <div className="h-[40px] w-[40px]" />
      </div>

      <header className="mt-3 px-6">
        <p className="eyebrow">SETTINGS · 偏好与隐私</p>
        <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-primary">
          <span className="ink-underline">把小满</span>调成你喜欢的样子。
        </h2>
        <p className="mt-3 text-[14px] font-light leading-6 text-secondary">
          这些都会同步到你的下一次记录。
        </p>
      </header>

      <Section eyebrow="NOTIFY · 提醒">
        <Row icon={<Bell className="h-4 w-4" strokeWidth={1.6} />} label="每日提醒" value={user.remind_enabled ? user.remind_time ?? "22:00" : "未开启"} toggleable defaultOn={Boolean(user.remind_enabled)} />
        <Row icon={<Volume2 className="h-4 w-4" strokeWidth={1.6} />} label="提示音" value="轻柔" />
        <Row icon={<Sparkles className="h-4 w-4" strokeWidth={1.6} />} label="灵感推送" value="每周一次" />
      </Section>

      <Section eyebrow="LOOK · 外观">
        <Row icon={<Palette className="h-4 w-4" strokeWidth={1.6} />} label="主题" value="奶油暖色" />
        <Row icon={<Moon className="h-4 w-4" strokeWidth={1.6} />} label="夜间模式" value="跟随系统" />
        <Row icon={<Globe2 className="h-4 w-4" strokeWidth={1.6} />} label="语言" value="简体中文" />
      </Section>

      <Section eyebrow="PRIVACY · 隐私与数据">
        <Row icon={<Lock className="h-4 w-4" strokeWidth={1.6} />} label="应用锁" value="未开启" />
        <Row icon={<Shield className="h-4 w-4" strokeWidth={1.6} />} label="隐私偏好" value="" linkable />
        <Row icon={<FileText className="h-4 w-4" strokeWidth={1.6} />} label="导出我的数据" value="" linkable />
      </Section>

      <Section eyebrow="ABOUT · 关于">
        <Row label="版本" value="1.0.0 · 小满" />
        <Row label="用户协议" value="" linkable />
        <Row label="隐私政策" value="" linkable />
        <Row label="意见反馈" value="" linkable />
      </Section>

      <section className="mx-6 mt-7 overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] shadow-[var(--card-shadow)] backdrop-blur-xl">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-5 py-[15px] text-[14px] text-[var(--accent-coral)] transition-colors hover:bg-white/30"
        >
          <span className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" strokeWidth={1.6} />
            注销账号
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--accent-coral)]" strokeWidth={1.5} />
        </button>
      </section>

      <div className="mt-7 flex justify-center">
        <LogoutButton />
      </div>

      <p className="mt-6 px-6 text-center font-garamond text-[12px] italic text-tertiary">
        — 小满会一直在这里 · made with care —
      </p>
    </div>
  );
}

function Section({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <section className="mx-6 mt-7">
      <p className="eyebrow mb-3 pl-1">{eyebrow}</p>
      <div className="overflow-hidden rounded-[22px] border border-white/70 bg-[var(--card-bg)] shadow-[var(--card-shadow)] backdrop-blur-xl">
        {children}
      </div>
    </section>
  );
}

function Row({
  icon,
  label,
  value,
  toggleable,
  defaultOn,
  linkable
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  toggleable?: boolean;
  defaultOn?: boolean;
  linkable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(180,150,100,0.10)] px-5 py-[15px] transition-colors last:border-b-0 hover:bg-white/30">
      <span className="flex items-center gap-3 text-[14px] text-primary">
        {icon ? <span className="text-[var(--accent-deep)]">{icon}</span> : null}
        {label}
      </span>
      {toggleable ? (
        <Toggle on={Boolean(defaultOn)} hint={value} />
      ) : linkable ? (
        <ChevronRight className="h-4 w-4 text-tertiary" strokeWidth={1.5} />
      ) : (
        <span className="text-right text-[13px] font-light text-secondary">{value}</span>
      )}
    </div>
  );
}

function Toggle({ on, hint }: { on: boolean; hint?: string }) {
  return (
    <div className="flex items-center gap-3">
      {hint ? <span className="font-garamond text-[12px] italic text-secondary">{hint}</span> : null}
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          on ? "bg-[var(--accent-coral)]" : "bg-[rgba(180,150,100,0.22)]"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-transform ${
            on ? "translate-x-[22px]" : "translate-x-[2px]"
          }`}
        />
      </span>
    </div>
  );
}
