export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-ivory">
      <div className="h-16 border-b border-line bg-white/70 animate-pulse" />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <div className="h-10 w-48 rounded-lg bg-stone/10 animate-pulse" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl border border-line bg-white p-5 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}

