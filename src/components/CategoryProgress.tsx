import { formatCurrency } from "@/lib/money";
import type { CategoryProgressData } from "@/types/finance";

interface CategoryProgressProps {
  category: CategoryProgressData;
}

function progressTone(percentage: number): string {
  if (percentage >= 90) {
    return "from-rose-500/80 to-red-300/60";
  }

  if (percentage >= 75) {
    return "from-orange-500/80 to-amber-300/60";
  }

  return "from-indigo-500/75 to-sky-300/55";
}

export function CategoryProgress({ category }: CategoryProgressProps) {
  return (
    <article className="rounded-lg border border-slate-800/80 bg-slate-900/55 p-5 shadow-sm shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-200">
            {category.label}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Ti rimangono {formatCurrency(category.remaining)} su{" "}
            {formatCurrency(category.limit)}
          </p>
        </div>
        <span className="text-sm tabular-nums text-slate-400">
          {Math.round(category.percentage)}%
        </span>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${progressTone(
            category.percentage,
          )}`}
          style={{ width: `${category.percentage}%` }}
        />
      </div>
    </article>
  );
}
