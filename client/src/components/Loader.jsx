/**
 * Loader — reusable loading components.
 *
 *  <PageLoader />         Full-page spinner for route transitions
 *  <ButtonSpinner />      Inline spinner for buttons
 *  <TableSkeleton />      Skeleton rows for data tables
 */

// ─── Full-page spinner ───
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-3 border-surface-800/50" />
      <div className="absolute inset-0 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
    </div>
    <p className="text-surface-500 text-sm">{message}</p>
  </div>
);

// ─── Inline button spinner ───
export const ButtonSpinner = ({ size = 4 }) => (
  <div className={`w-${size} h-${size} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
);

// ─── Table skeleton loader ───
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl overflow-hidden">
    {/* Header */}
    <div className="flex border-b border-surface-800/50 px-5 py-3.5 gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-3 bg-surface-800/60 rounded-full animate-pulse flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex px-5 py-4 gap-4 border-b border-surface-800/20 last:border-0">
        {Array.from({ length: cols }).map((_, c) => (
          <div
            key={c}
            className="h-3 bg-surface-800/40 rounded-full animate-pulse flex-1"
            style={{ animationDelay: `${(r * cols + c) * 75}ms` }}
          />
        ))}
      </div>
    ))}
  </div>
);

// ─── Card skeleton loader ───
export const CardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-surface-900/60 border border-surface-800/50 rounded-2xl p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-2.5 w-20 bg-surface-800/50 rounded-full animate-pulse" />
            <div className="h-6 w-14 bg-surface-800/40 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          </div>
          <div className="w-10 h-10 bg-surface-800/50 rounded-xl animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export default PageLoader;
