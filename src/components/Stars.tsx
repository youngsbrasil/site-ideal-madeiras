import { Star } from "lucide-react";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i < full || (i === full && half) ? "currentColor" : "none"}
          className={i < full || (i === full && half) ? "" : "text-neutral-300"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export function RatingBadge({ average, total, className = "" }: { average: number; total: number; className?: string }) {
  if (total === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${className}`}>
      <Stars value={average} size={12} />
      <span>{average.toFixed(1)}</span>
      <span className="opacity-70">· {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total} avaliações</span>
    </span>
  );
}
