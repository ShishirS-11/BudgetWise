function ProgressBar({ value }) {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bw-surface-alt)]">
      <div
        className="h-full rounded-full bg-amber-500 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default ProgressBar