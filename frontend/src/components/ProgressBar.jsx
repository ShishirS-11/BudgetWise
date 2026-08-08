function ProgressBar({ value }) {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full bg-violet-500 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default ProgressBar