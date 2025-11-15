export function LoadingState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6">
      <div className="flex animate-pulse flex-col gap-4">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-xl border border-slate-100 p-4">
              <div className="h-3 w-1/2 rounded bg-slate-200" />
              <div className="mt-3 h-6 w-2/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="h-48 rounded-xl border border-slate-100 bg-slate-50" />
      </div>
    </div>
  );
}

