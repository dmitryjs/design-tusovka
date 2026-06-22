import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  className?: string;
};

export function AdminStatCard({ label, value, hint, className }: AdminStatCardProps) {
  return (
    <div className={cn("rounded-xl border border-neutral-200 bg-white p-4", className)}>
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
