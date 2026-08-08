import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Overview', path: '/' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Budget', path: '/budget' },
  { label: 'Goals', path: '/goals' },
  { label: 'Reports', path: '/reports' },
  { label: 'Insights', path: '/insights' },
]

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0a0c0e] text-zinc-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#0d0f11] md:flex md:flex-col">
          {/* Logo */}
          <div className="border-b border-white/5 px-6 py-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                BudgetWise
              </h1>

              <p className="mt-0.5 text-xs text-zinc-500">
                Personal finance
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
              Workspace
            </p>

            <div className="space-y-1">
              {navigation.map((item) => (
                <NavItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                />
              ))}
            </div>
          </nav>

          {/* Settings */}
          <div className="border-t border-white/5 p-4">
            <NavItem
              label="Settings"
              path="/settings"
            />
          </div>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-white/5 px-6 lg:px-10">
            <div>
              <p className="text-sm text-zinc-500">
                Friday, August 8
              </p>

              <h2 className="mt-1 text-lg font-medium">
                BudgetWise
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                type="button"
                className="hidden rounded-lg border border-white/5 px-3 py-2 text-sm text-zinc-400 transition hover:border-white/10 hover:text-zinc-200 sm:block"
              >
                Search
              </button>

              {/* Theme button */}
              <button
                type="button"
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 text-sm text-zinc-400 transition hover:border-white/10 hover:text-zinc-200"
              >
                ☾
              </button>

              {/* Profile */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-400">
                U
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function NavItem({ label, path }) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2.5 text-sm transition ${
          isActive
            ? 'bg-violet-500/10 text-violet-300'
            : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default AppLayout