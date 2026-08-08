import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabaseClient'

function Login() {
  const navigate = useNavigate()

  const [isSignUp, setIsSignUp] = useState(false)

  const [name, setName] = useState('')
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

  const [success, setSuccess] =
    useState('')


  /* ============================================================
     LOGIN / SIGNUP
  ============================================================ */

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (isSignUp && !name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters long.',
      )
      return
    }

    setLoading(true)

    try {

      /* ========================================================
         SIGN UP
      ======================================================== */

      if (isSignUp) {
        const {
          data,
          error: signUpError,
        } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
              full_name: name.trim(),
            },
          },
        })

        if (signUpError) {
          throw signUpError
        }

        /*
         * If Supabase automatically creates
         * a session, go directly to Dashboard.
         */

        if (data?.session) {
          navigate('/', {
            replace: true,
          })

          return
        }

        /*
         * Email confirmation enabled.
         */

        setSuccess(
          'Account created successfully. Please check your email to confirm your account.',
        )

        setPassword('')

        return
      }


      /* ========================================================
         LOGIN
      ======================================================== */

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

    } catch (authError) {

      console.error(
        'Authentication error:',
        authError,
      )

      setError(
        authError?.message ||
          'Something went wrong. Please try again.',
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
    setSuccess('')

    if (!email.trim()) {
      setError(
        'Enter your email address first.',
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

      setSuccess(
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


  /* ============================================================
     SWITCH LOGIN / SIGNUP
  ============================================================ */

  function switchMode() {
    setIsSignUp(
      (current) => !current,
    )

    setError('')
    setSuccess('')

    setName('')
    setPassword('')
  }


  return (
    <div className="login-page">

      {/* ======================================================
          BACKGROUND
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
              {isSignUp
                ? 'START YOUR JOURNEY'
                : 'YOUR MONEY, YOUR WAY'}
            </p>

            <h2 className="login-title">

              {isSignUp ? (
                <>
                  Build better
                  <br />
                  money habits.
                </>
              ) : (
                <>
                  Take control
                  <br />
                  of your money.
                </>
              )}

            </h2>

            <p className="login-description">

              {isSignUp
                ? 'Create your BudgetWise account and start managing your money smarter.'
                : 'Track expenses, set goals and save more every day.'}

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


          <p className="login-footer">
            Simple money management for everyday life.
          </p>

        </section>


        {/* ====================================================
            RIGHT SIDE
        ===================================================== */}

        <section className="login-right">

          <div className="login-card">

            {/* AMBER ACCENTS */}

            <div
              className="
                login-accent
                accent-one
              "
            />

            <div
              className="
                login-accent
                accent-two
              "
            />


            {/* HEADER */}

            <div className="login-card-header">

              <h3 className="login-card-title">

                {isSignUp
                  ? 'Create your account'
                  : 'Welcome back!'}

              </h3>

              <p className="login-card-subtitle">

                {isSignUp
                  ? 'Join BudgetWise today'
                  : 'Login to continue'}

              </p>

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-message">
                {error}
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-green-500/20
                  bg-green-500/10
                  px-4
                  py-3
                  text-sm
                  leading-5
                  text-green-400
                "
              >
                {success}
              </div>
            )}


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="login-form"
            >

              {/* NAME */}

              {isSignUp && (
                <div className="login-field">

                  <label
                    htmlFor="name"
                    className="login-label"
                  >
                    Name
                  </label>

                  <div className="login-input-wrapper">

                    <span className="login-input-icon">
                      👤
                    </span>

                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value,
                        )
                      }
                      placeholder="Your name"
                      className="login-input"
                    />

                  </div>

                </div>
              )}


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
                    autoComplete={
                      isSignUp
                        ? 'new-password'
                        : 'current-password'
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
                    className="
                      login-input
                      login-password-input
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="
                      login-password-toggle
                    "
                  >
                    {showPassword
                      ? '◉'
                      : '◌'}
                  </button>

                </div>

              </div>


              {/* LOGIN OPTIONS */}

              {!isSignUp && (
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
              )}


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >

                {loading
                  ? isSignUp
                    ? 'Creating account...'
                    : 'Logging in...'
                  : isSignUp
                    ? 'Create account'
                    : 'Log in'}

              </button>

            </form>


            {/* SWITCH */}

            <p className="signup-text">

              {isSignUp
                ? 'Already have an account?'
                : "Don't have an account?"}

              {' '}

              <button
                type="button"
                onClick={switchMode}
                className="signup-link"
              >

                {isSignUp
                  ? 'Log in'
                  : 'Sign up'}

              </button>

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