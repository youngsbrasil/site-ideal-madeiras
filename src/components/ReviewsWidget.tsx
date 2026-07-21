import { useQuery } from "@tanstack/react-query";
import { fetchPublicReviews, fetchReviewsStats, fetchReviewWidget, type ReviewWidget } from "@/lib/site-data";
import { Stars, RatingBadge } from "./Stars";
import { Quote } from "lucide-react";

type Props = {
  scope: ReviewWidget["scope"];
  scopeRef?: string | null;
  fallback?: Partial<ReviewWidget>;
};

const defaults: ReviewWidget = {
  id: "default",
  scope: "home",
  scope_ref: null,
  layout: "carousel",
  max_items: 6,
  min_rating: 4,
  show_average: true,
  show_cta_badge: true,
  active: true,
};

export function ReviewsWidget({ scope, scopeRef = null, fallback }: Props) {
  const { data: widget } = useQuery({
    queryKey: ["review-widget", scope, scopeRef],
    queryFn: () => fetchReviewWidget(scope, scopeRef),
  });
  const cfg: ReviewWidget = { ...defaults, ...(fallback ?? {}), ...(widget ?? {}) } as ReviewWidget;

  const { data: reviews = [] } = useQuery({
    queryKey: ["public-reviews", cfg.max_items, cfg.min_rating],
    queryFn: () => fetchPublicReviews({ minRating: cfg.min_rating, limit: cfg.max_items }),
  });
  const { data: stats } = useQuery({ queryKey: ["reviews-stats"], queryFn: fetchReviewsStats });

  if (reviews.length === 0) return null;

  if (cfg.layout === "badge") {
    return stats ? <RatingBadge average={stats.average} total={stats.total} /> : null;
  }

  const isCompact = cfg.layout === "compact";
  const isCarousel = cfg.layout === "carousel";

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">O que dizem nossos clientes</h2>
          {cfg.show_average && stats && (
            <div className="flex items-center gap-2 mt-1 text-sm text-neutral-600">
              <Stars value={stats.average} size={16} />
              <b className="text-neutral-900">{stats.average.toFixed(1)}</b>
              <span>· {stats.total} avaliações no Google</span>
            </div>
          )}
        </div>
      </div>

      <div
        className={
          isCarousel
            ? "flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
            : isCompact
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        }
      >
        {reviews.map((r) => (
          <article
            key={r.id}
            className={`bg-white border border-neutral-200 rounded-xl p-5 shadow-sm ${isCarousel ? "min-w-[320px] snap-start" : ""}`}
          >
            <div className="flex items-center gap-3 mb-3">
              {r.author_avatar_url ? (
                <img src={r.author_avatar_url} alt={r.author_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600">
                  {r.author_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-neutral-900 truncate">{r.author_name}</p>
                <Stars value={r.rating} />
              </div>
              {r.featured && <span className="text-[10px] uppercase text-amber-600 font-bold">Destaque</span>}
            </div>
            {r.content && (
              <p className={`text-sm text-neutral-700 leading-relaxed relative ${isCompact ? "line-clamp-3" : "line-clamp-6"}`}>
                <Quote className="w-4 h-4 text-neutral-300 inline mr-1 -mt-1" />
                {r.content}
              </p>
            )}
            {r.review_date && (
              <p className="text-xs text-neutral-400 mt-3">
                {new Date(r.review_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
