function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-medium tracking-tight text-zinc-100">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-zinc-500">
            {description}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          className="text-sm text-violet-300 transition hover:text-violet-200"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export default SectionHeader