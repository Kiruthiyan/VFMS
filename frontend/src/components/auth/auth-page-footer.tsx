import Link from "next/link";

interface AuthPageFooterProps {
  prompt: string;
  actionLabel: string;
  actionHref: string;
  supportingText?: string;
}

export function AuthPageFooter({
  prompt,
  actionLabel,
  actionHref,
  supportingText = "Use verified company credentials to continue securely in VFMS.",
}: AuthPageFooterProps) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/90 px-6 py-5 text-center shadow-sm backdrop-blur">
      <p className="text-sm font-medium text-slate-600">
        {prompt}{" "}
        <Link
          href={actionHref}
          className="font-semibold text-slate-950 transition-colors hover:text-amber-600"
        >
          {actionLabel}
        </Link>
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-500">{supportingText}</p>
    </div>
  );
}
