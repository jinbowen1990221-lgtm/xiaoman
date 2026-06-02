import { StarMascot } from "@/components/decorative/StarMascot";

export default function Loading() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-5 px-6">
      <StarMascot size={84} />
      <p className="font-garamond text-[14px] italic text-secondary soft-breathe">
        小满正在翻你的本子…
      </p>
    </div>
  );
}
