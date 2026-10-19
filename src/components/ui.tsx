import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 size={18} className={`spin text-cyan-300 ${className}`} />;
}

export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-amber-400/25 bg-amber-400/5 ${
        compact ? 'px-4 py-2.5' : 'px-5 py-4'
      }`}
    >
      <p className={`text-amber-200/90 ${compact ? 'text-xs' : 'text-sm'}`}>
        <strong className="font-semibold">Educational prototype.</strong>{' '}
        This tool produces an experimental ML risk classification — not a confirmed
        medical diagnosis. Always consult a qualified healthcare professional.
      </p>
    </div>
  );
}
