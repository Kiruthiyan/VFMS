type FormErrorSummaryProps = {
  messages: string[];
  title?: string;
  className?: string;
};

export function FormErrorSummary({ messages, title = 'Please fix the highlighted fields.', className }: FormErrorSummaryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={className} role="alert" aria-live="polite">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        <p className="font-medium">{title}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
          {messages.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}