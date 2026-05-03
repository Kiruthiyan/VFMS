import Link from "next/link";

interface AuthPageFooterProps {
  prompt: string;
  actionLabel: string;
  actionHref: string;
  supportingText?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function AuthPageFooter({
  prompt,
  actionLabel,
  actionHref,
  supportingText = "Use verified company credentials to continue securely in FleetPro.",
  secondaryLabel,
  secondaryHref,
}: AuthPageFooterProps) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white/88 px-5 py-4 text-center shadow-sm backdrop-blur">
      <p className="text-sm font-medium text-slate-600">
        {prompt}{" "}
        <Link
          href={actionHref}
          className="font-semibold text-slate-950 transition-colors hover:text-amber-600"
        >
          {actionLabel}
        </Link>
      </p>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">{supportingText}</p>
      {secondaryLabel && secondaryHref ? (
        <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <span className="h-px w-8 bg-slate-200" />
          <Link
            href={secondaryHref}
            className="transition-colors hover:text-amber-600"
          >
            {secondaryLabel}
          </Link>
          <span className="h-px w-8 bg-slate-200" />
        </div>
      ) : null}
    </div>
  );
}
