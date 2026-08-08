function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-medium tracking-tight text-[var(--bw-text-strong)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-[var(--bw-text-muted)]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          className="text-sm text-amber-300 transition hover:text-amber-200"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export default SectionHeader