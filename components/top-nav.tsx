import Link from "next/link";

type TopNavProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
};

export function TopNav({ title, subtitle, backHref = "/" }: TopNavProps) {
  return (
    <header className="mb-6 grid h-12 grid-cols-[72px_1fr_72px] items-center">
      <Link href={backHref} className="text-sm font-medium text-primary">
        ← 返回
      </Link>
      <div className="text-center">
        <div className="text-[15px] font-medium text-primary">{title}</div>
        {subtitle ? <div className="mt-0.5 text-[11px] text-tertiary">{subtitle}</div> : null}
      </div>
      <div />
    </header>
  );
}
