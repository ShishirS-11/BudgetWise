function StatCard({ label, value, description, accent = false }) {
  return (
    <div className="rounded-2xl border border-[var(--bw-border)] bg-[var(--bw-surface)] p-6">
      <p className="text-sm text-[var(--bw-body)]">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${
          accent ? 'text-amber-300' : 'text-[var(--bw-heading)]'
        }`}
      >
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-[var(--bw-muted)]">
          {description}
        </p>
      )}
    </div>
  )
}

export default StatCard