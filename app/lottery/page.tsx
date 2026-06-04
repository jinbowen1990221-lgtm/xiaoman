import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LotterySelector } from "@/components/lottery-selector";
import { getCurrentUser } from "@/lib/auth";
import {
  emptyLotteryNumbers,
  generateAllLotteryNumbers,
  type LotteryNumbers,
  type LotteryType
} from "@/lib/lottery";

const lotteryTypes: LotteryType[] = ["double_color", "super_lotto", "arrangement_3"];

export default async function LotteryPage() {
  const user = await getCurrentUser();
  const requiresBirthday = !user?.birthday;
  const numbers: Record<LotteryType, LotteryNumbers> = user?.birthday
    ? generateAllLotteryNumbers(user.birthday, user.id)
    : (Object.fromEntries(
        lotteryTypes.map((type) => [type, emptyLotteryNumbers(type)])
      ) as Record<LotteryType, LotteryNumbers>);

  return (
    <div className="stagger-in relative z-10 pb-16">
      <div className="flex h-14 items-center justify-between px-5 pt-2">
        <Link
          href="/"
          aria-label="返回"
          className="grid h-[40px] w-[40px] place-items-center rounded-full border border-white/70 bg-[rgba(255,251,243,0.66)] text-primary shadow-[var(--card-shadow)] backdrop-blur-xl"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.6} />
        </Link>
        <h1 className="font-serif text-[16px] font-medium text-primary">本周幸运号</h1>
        <button type="button" className="font-garamond text-[13px] italic text-[var(--accent-coral)]">
          规则
        </button>
      </div>

      <div className="mt-4 px-6">
        <p className="eyebrow">LUCKY · 本周幸运号</p>
        <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-primary">
          <span className="ink-underline">选一个</span>你喜欢的
        </h2>
        <p className="mt-3 text-[14px] font-light leading-6 text-secondary">每周一刷新一次，小满为你挑。</p>
      </div>

      <div className="mt-6 px-6">
        <LotterySelector
          numbers={numbers}
          preferredLottery={user?.preferred_lottery ?? "double_color"}
          requiresBirthday={requiresBirthday}
        />
      </div>
    </div>
  );
}
