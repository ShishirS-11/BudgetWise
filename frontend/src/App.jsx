import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import TripWiseLayout from './layouts/TripWiseLayout'

import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Calendar from './pages/Calendar'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Reports from './pages/Reports'
import Insights from './pages/Insights'
import Settings from './pages/Settings'
import Login from './pages/Login'

import TripWise from './pages/TripWise'
import CreateTrip from './pages/CreateTrip'
import TripItinerary from './pages/TripItinerary'
import TripCalendar from './pages/TripCalendar'
import TripExpenses from './pages/TripExpenses'
import TripMembers from './pages/TripMembers'
import TripPayments from './pages/TripPayments'

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext'

import {
  CurrencyProvider,
} from './context/CurrencyContext'


/* ============================================================
   PROTECTED ROUTES
   ============================================================ */

function ProtectedRoutes() {
  const {
    user,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bw-bg)] text-[var(--bw-text-secondary)]">
        <div className="text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bw-accent-soft)] text-xl">
            💰
          </div>

          <p className="text-sm">
            Loading BudgetWise...
          </p>

        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}


/* ============================================================
   APP
   ============================================================ */

function App() {
  return (
    <AuthProvider>

      <CurrencyProvider>

        <Routes>

          {/* ==================================================
              PUBLIC
          ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ==================================================
              EVERYTHING BELOW REQUIRES LOGIN
          ================================================== */}

          <Route
            element={<ProtectedRoutes />}
          >


            {/* =================================================
                BUDGETWISE
            ================================================= */}

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


            {/* =================================================
                TRIPWISE
            ================================================= */}

            <Route
              element={<TripWiseLayout />}
            >

              <Route
                path="/tripwise"
                element={<TripWise />}
              />

              <Route
                path="/tripwise/create"
                element={<CreateTrip />}
              />

              <Route
                path="/tripwise/itinerary"
                element={<TripItinerary />}
              />

              <Route
                path="/tripwise/calendar"
                element={<TripCalendar />}
              />

              <Route
                path="/tripwise/expenses"
                element={<TripExpenses />}
              />

              <Route
                path="/tripwise/members"
                element={<TripMembers />}
              />

              <Route
                path="/tripwise/payments"
                element={<TripPayments />}
              />

            </Route>

          </Route>


          {/* ==================================================
              UNKNOWN ROUTES
          ================================================== */}

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