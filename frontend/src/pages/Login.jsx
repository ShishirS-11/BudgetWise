import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabaseClient'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [rememberMe, setRememberMe] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  /* ============================================================
     LOGIN
  ============================================================ */

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError(
        'Please enter your email address.',
      )
      return
    }

    if (!password) {
      setError(
        'Please enter your password.',
      )
      return
    }

    setLoading(true)

    try {
      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) {
        throw loginError
      }

      if (!data?.user) {
        throw new Error(
          'Unable to sign you in. Please try again.',
        )
      }

      navigate('/', {
        replace: true,
      })
    } catch (loginError) {
      console.error(
        'Login error:',
        loginError,
      )

      setError(
        loginError?.message ||
          'Unable to sign in. Please check your credentials.',
      )
    } finally {
      setLoading(false)
    }
  }

  /* ============================================================
     FORGOT PASSWORD
  ============================================================ */

  async function handleForgotPassword() {
    setError('')

    if (!email.trim()) {
      setError(
        'Enter your email address first, then click Forgot password.',
      )
      return
    }

    setLoading(true)

    try {
      const {
        error: resetError,
      } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          },
        )

      if (resetError) {
        throw resetError
      }

      setError(
        'Password reset link sent. Check your email.',
      )
    } catch (resetError) {
      console.error(
        'Password reset error:',
        resetError,
      )

      setError(
        resetError?.message ||
          'Unable to send password reset email.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* ======================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          login-decoration
          login-decoration-one
        "
      />

      <div
        className="
          login-decoration
          login-decoration-two
        "
      />

      <div
        className="
          login-decoration
          login-decoration-three
        "
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="login-container">

        {/* ====================================================
            LEFT SIDE
        ===================================================== */}

        <section className="login-left">

          {/* BRAND */}

          <div className="login-brand">

            <div className="login-brand-icon">
              📊
            </div>

            <div>

              <h1 className="login-brand-name">
                BudgetWise
              </h1>

              <p className="login-brand-subtitle">
                PERSONAL FINANCE
              </p>

            </div>

          </div>


          {/* HERO */}

          <div className="login-hero">

            <p className="login-eyebrow">
              YOUR MONEY, YOUR WAY
            </p>

            <h2 className="login-title">
              Take control
              <br />
              of your money.
            </h2>

            <p className="login-description">
              Track expenses, set goals and save
              more every day.
            </p>


            {/* FEATURES */}

            <div className="login-features">

              <Feature
                icon="💰"
                text="Track every expense"
              />

              <Feature
                icon="📊"
                text="Plan your budget"
              />

              <Feature
                icon="🎯"
                text="Reach your financial goals"
              />

            </div>

          </div>


          {/* DESKTOP FOOTER */}

          <p className="login-footer">
            Simple money management for everyday life.
          </p>

        </section>


        {/* ====================================================
            RIGHT SIDE
        ===================================================== */}

        <section className="login-right">

          <div className="login-card">

            {/* AMBER ACCENT */}

            <div className="login-accent accent-one" />
            <div className="login-accent accent-two" />


            {/* HEADER */}

            <div className="login-card-header">

              <h3 className="login-card-title">
                Welcome back!
              </h3>

              <p className="login-card-subtitle">
                Login to continue
              </p>

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-message">
                {error}
              </div>
            )}


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="login-form"
            >

              {/* EMAIL */}

              <div className="login-field">

                <label
                  htmlFor="email"
                  className="login-label"
                >
                  Email
                </label>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="you@example.com"
                    className="login-input"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="login-field">

                <label
                  htmlFor="password"
                  className="login-label"
                >
                  Password
                </label>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
                    className="login-input login-password-input"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="login-password-toggle"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword
                      ? '◉'
                      : '◌'}
                  </button>

                </div>

              </div>


              {/* REMEMBER / FORGOT */}

              <div className="login-options">

                <label className="remember-label">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    className="remember-checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>


                <button
                  type="button"
                  onClick={
                    handleForgotPassword
                  }
                  disabled={loading}
                  className="forgot-button"
                >
                  Forgot password?
                </button>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading
                  ? 'Logging in...'
                  : 'Log in'}
              </button>

            </form>


            {/* SIGN UP */}

            <p className="signup-text">

              Don't have an account?{' '}

              <Link
                to="/signup"
                className="signup-link"
              >
                Sign up
              </Link>

            </p>

          </div>

        </section>

      </div>

    </div>
  )
}


/* ============================================================
   FEATURE
============================================================ */

function Feature({
  icon,
  text,
}) {
  return (
    <div className="login-feature">

      <span className="feature-icon">
        {icon}
      </span>

      <span className="feature-text">
        {text}
      </span>

    </div>
  )
}

export default Login