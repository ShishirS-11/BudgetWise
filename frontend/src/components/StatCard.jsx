function StatCard({ label, value, description, accent = false }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111417] p-6">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${
          accent ? 'text-violet-300' : 'text-zinc-100'
        }`}
      >
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-zinc-600">
          {description}
        </p>
      )}
    </div>
  )
}

export default StatCard