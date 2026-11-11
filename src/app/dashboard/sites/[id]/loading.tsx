export default function EditorLoading() {
  return (
    <div className="flex h-svh flex-col bg-cream">
      <div className="h-14 border-b border-line bg-white animate-pulse" />
      <div className="flex flex-1">
        <aside className="w-full border-r border-line bg-white p-5 lg:w-[420px] animate-pulse space-y-4">
          <div className="h-8 w-3/4 rounded bg-stone/10" />
          <div className="h-24 w-full rounded-xl bg-stone/10" />
          <div className="h-40 w-full rounded-xl bg-stone/10" />
        </aside>
        <main className="hidden flex-1 items-center justify-center p-8 lg:flex">
          <div className="h-3/4 w-2/3 rounded-2xl bg-white shadow-sm animate-pulse" />
        </main>
      </div>
    </div>
  );
}

