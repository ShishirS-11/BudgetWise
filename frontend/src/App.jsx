import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'

import AppLayout from './layouts/AppLayout'

import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Calendar from './pages/Calendar'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Reports from './pages/Reports'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Login from './pages/Login'

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext'

import {
  CurrencyProvider,
} from './context/CurrencyContext'


function ProtectedRoutes() {
  const {
    user,
    loading,
  } = useAuth()

  /*
   * Wait for Supabase to determine
   * whether a session exists.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d0f] text-zinc-500">
        <p className="text-sm">
          Loading BudgetWise...
        </p>
      </div>
    )
  }

  /*
   * No logged-in user:
   * send them to Login.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  /*
   * User is authenticated:
   * render the protected route.
   */
  return <Outlet />
}


function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>

        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* =========================
              PROTECTED ROUTES
          ========================== */}

          <Route
            element={<ProtectedRoutes />}
          >

            <Route
              element={<AppLayout />}
            >

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/expenses"
                element={<Expenses />}
              />

              <Route
                path="/calendar"
                element={<Calendar />}
              />

              <Route
                path="/budget"
                element={<Budget />}
              />

              <Route
                path="/goals"
                element={<Goals />}
              />

              <Route
                path="/reports"
                element={<Reports />}
              />

              <Route
                path="/insights"
                element={<Insights />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />

            </Route>

          </Route>

          {/* =========================
              UNKNOWN ROUTES
          ========================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </CurrencyProvider>
    </AuthProvider>
  )
}

export default App