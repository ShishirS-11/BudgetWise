import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  signIn,
  signUp,
} from '../services/authService'

function Login() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const isLogin = mode === 'login'

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setMessage('')

    const cleanEmail = email.trim()
    const cleanName = fullName.trim()

    if (!cleanEmail || !password) {
      setError(
        'Please enter your email and password.',
      )
      return
    }

    if (!isLogin && !cleanName) {
      setError('Please enter your full name.')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.',
      )
      return
    }

    try {
      setLoading(true)

      if (isLogin) {
        await signIn(
          cleanEmail,
          password,
        )

        navigate('/', {
          replace: true,
        })

        return
      }

      const data = await signUp(
        cleanEmail,
        password,
        cleanName,
      )

      if (data.session) {
        navigate('/', {
          replace: true,
        })

        return
      }

      setMessage(
        'Account created successfully. Please check your email and confirm your account before signing in.',
      )

      setMode('login')
      setPassword('')
    } catch (err) {
      setError(
        getAuthErrorMessage(err),
      )
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(
      isLogin
        ? 'signup'
        : 'login',
    )

    setError('')
    setMessage('')
    setPassword('')
  }

  return (
    <main className="min-h-screen bg-[#0b0d0f] px-4 py-10 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <section className="w-full">

          {/* Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              BudgetWise
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Personal finance, simplified.
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-2xl border border-white/5 bg-[#111417] p-6 shadow-2xl">

            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {isLogin
                  ? 'Welcome back'
                  : 'Create your account'}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {isLogin
                  ? 'Sign in to continue to BudgetWise.'
                  : 'Start managing your money with BudgetWise.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-500/10 bg-red-500/[0.05] px-4 py-3">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mt-5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.05] px-4 py-3">
                <p className="text-sm leading-6 text-emerald-400">
                  {message}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >

              {/* Full name */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm text-zinc-400"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(
                        event.target.value,
                      )
                    }
                    placeholder="Your name"
                    autoComplete="name"
                    disabled={loading}
                    className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/50 disabled:opacity-50"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/50 disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="At least 6 characters"
                  autoComplete={
                    isLogin
                      ? 'current-password'
                      : 'new-password'
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-[#0d0f11] px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/50 disabled:opacity-50"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? isLogin
                    ? 'Signing in...'
                    : 'Creating account...'
                  : isLogin
                    ? 'Sign in'
                    : 'Create account'}
              </button>
            </form>

            {/* Switch */}
            <div className="mt-6 border-t border-white/5 pt-5 text-center">
              <p className="text-sm text-zinc-600">
                {isLogin
                  ? "Don't have an account?"
                  : 'Already have an account?'}
              </p>

              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="mt-2 text-sm font-medium text-violet-300 transition hover:text-violet-200 disabled:opacity-50"
              >
                {isLogin
                  ? 'Create an account'
                  : 'Sign in instead'}
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-700">
            Your financial data belongs to you.
          </p>
        </section>
      </div>
    </main>
  )
}

function getAuthErrorMessage(error) {
  const message =
    error?.message || ''

  const lowerMessage =
    message.toLowerCase()

  if (
    lowerMessage.includes(
      'invalid login credentials',
    )
  ) {
    return 'Incorrect email or password.'
  }

  if (
    lowerMessage.includes(
      'user already registered',
    )
  ) {
    return 'An account with this email already exists. Try signing in instead.'
  }

  if (
    lowerMessage.includes(
      'email not confirmed',
    )
  ) {
    return 'Please confirm your email address before signing in.'
  }

  if (
    lowerMessage.includes(
      'password should be at least',
    )
  ) {
    return 'Password must be at least 6 characters.'
  }

  return (
    message ||
    'Something went wrong. Please try again.'
  )
}

export default Login