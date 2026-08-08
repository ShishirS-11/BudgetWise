import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabaseClient'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
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
      } = await supabase.auth.resetPasswordForEmail(
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
    <div
      className="
        budgetwise-login-page
        relative
        h-screen
        w-full
        overflow-hidden
        bg-[#151716]
        text-[#f5f0e7]
      "
    >

      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-[360px]
          w-[360px]
          rounded-full
          bg-[#d99100]/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-52
          -left-40
          h-[560px]
          w-[560px]
          rounded-full
          border
          border-[#d99100]/20
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          bottom-10
          left-[44%]
          h-28
          w-28
          rounded-full
          bg-[#d99100]/10
        "
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          w-full
          max-w-[1500px]
          flex-col
          px-7
          py-7
          lg:flex-row
          lg:items-center
          lg:gap-20
          lg:px-16
          lg:py-8
        "
      >

        {/* ===================================================
            LEFT SIDE
        ==================================================== */}

        <section
          className="
            flex
            flex-1
            flex-col
            justify-between
            py-2
            lg:min-h-0
          "
        >

          {/* BRAND */}

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#e29a00]
                text-3xl
                shadow-[0_10px_35px_rgba(226,154,0,0.25)]
              "
            >
              📊
            </div>

            <div>

              <h1
                className="
                  font-serif
                  text-4xl
                  font-bold
                  leading-none
                  tracking-tight
                  text-[#f7f2e8]
                  sm:text-[42px]
                "
              >
                BudgetWise
              </h1>

              <p
                className="
                  mt-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.28em]
                  text-[#e29a00]
                "
              >
                Personal Finance
              </p>

            </div>

          </div>


          {/* HERO */}

          <div
            className="
              mt-10
              max-w-[650px]
              lg:mt-0
            "
          >

            <p
              className="
                mb-6
                text-sm
                font-bold
                uppercase
                tracking-[0.3em]
                text-[#e29a00]
                sm:text-base
              "
            >
              Your money, your way
            </p>

            <h2
              className="
                max-w-[650px]
                font-serif
                text-5xl
                font-semibold
                leading-[1.04]
                tracking-tight
                text-[#f5f0e7]
                sm:text-6xl
              "
            >
              Take control
              <br />
              of your money.
            </h2>

            <p
              className="
                mt-7
                max-w-[560px]
                text-base
                leading-7
                text-[#bcb7ae]
                sm:text-lg
              "
            >
              Track expenses, set goals and save
              more every day.
            </p>


            {/* FEATURES */}

            <div
              className="
                mt-9
                space-y-5
              "
            >

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


          {/* BOTTOM TEXT */}

          <div
            className="
              hidden
              text-sm
              text-[#777a75]
              lg:block
            "
          >
            Simple money management for
            everyday life.
          </div>

        </section>


        {/* ===================================================
            RIGHT SIDE — LOGIN CARD
        ==================================================== */}

        <section
          className="
            flex
            w-full
            flex-1
            items-center
            justify-center
            py-8
            lg:max-w-[540px]
            lg:py-0
          "
        >

          <div
            className="
              relative
              w-full
              max-w-[500px]
              overflow-hidden
              rounded-[22px]
              border
              border-[#393b38]
              bg-[#242624]
              px-8
              py-9
              shadow-[0_30px_80px_rgba(0,0,0,0.38)]
              sm:px-10
              sm:py-10
            "
          >

            {/* LEFT AMBER ACCENT LINES */}

            <div
              className="
                absolute
                left-0
                top-[100px]
                h-20
                w-[3px]
                bg-[#e29a00]
              "
            />

            <div
              className="
                absolute
                left-0
                top-[220px]
                h-20
                w-[3px]
                bg-[#e29a00]
              "
            />


            {/* LOGIN HEADER */}

            <div
              className="
                text-center
              "
            >

              <h3
                className="
                  font-serif
                  text-3xl
                  font-semibold
                  text-[#f7f2e8]
                  sm:text-[34px]
                "
              >
                Welcome back!
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-[#969b95]
                  sm:text-[15px]
                "
              >
                Login to continue
              </p>

            </div>


            {/* ERROR MESSAGE */}

            {error && (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-[#d99100]/30
                  bg-[#d99100]/10
                  px-4
                  py-3
                  text-sm
                  leading-5
                  text-[#f0c36b]
                "
              >
                {error}
              </div>
            )}


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="
                mt-8
                space-y-5
              "
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-[#ddd8ce]
                  "
                >
                  Email
                </label>

                <div
                  className="
                    relative
                  "
                >

                  <span
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-base
                      text-[#8e948d]
                    "
                  >
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
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#393c39]
                      bg-[#2d302d]
                      py-4
                      pl-11
                      pr-4
                      text-base
                      text-[#f2eee6]
                      outline-none
                      transition
                      duration-200
                      placeholder:text-[#777c76]
                      focus:border-[#d99100]
                      focus:bg-[#303330]
                      focus:ring-2
                      focus:ring-[#d99100]/20
                    "
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-[#ddd8ce]
                  "
                >
                  Password
                </label>

                <div
                  className="
                    relative
                  "
                >

                  <span
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-base
                      text-[#8e948d]
                    "
                  >
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
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[#393c39]
                      bg-[#2d302d]
                      py-4
                      pl-11
                      pr-12
                      text-base
                      text-[#f2eee6]
                      outline-none
                      transition
                      duration-200
                      placeholder:text-[#777c76]
                      focus:border-[#d99100]
                      focus:bg-[#303330]
                      focus:ring-2
                      focus:ring-[#d99100]/20
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
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-base
                      text-[#8e948d]
                      transition
                      hover:text-[#e29a00]
                    "
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


              {/* REMEMBER + FORGOT */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    text-sm
                    text-[#aaa9a2]
                  "
                >

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(
                        event.target.checked,
                      )
                    }
                    className="
                      h-4
                      w-4
                      accent-[#d99100]
                    "
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
                  className="
                    text-sm
                    font-medium
                    text-[#e29a00]
                    transition
                    hover:text-[#f2b52f]
                    disabled:opacity-50
                  "
                >
                  Forgot password?
                </button>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-2
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#e29a00]
                  px-4
                  py-4
                  text-base
                  font-bold
                  text-[#171817]
                  shadow-[0_10px_25px_rgba(226,154,0,0.20)]
                  transition
                  duration-200
                  hover:bg-[#f0a915]
                  hover:shadow-[0_12px_30px_rgba(226,154,0,0.28)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? 'Logging in...'
                  : 'Log in'}
              </button>

            </form>


            {/* SIGN UP */}

            <p
              className="
                mt-7
                text-center
                text-sm
                text-[#969a94]
              "
            >
              Don't have an account?{' '}

              <Link
                to="/signup"
                className="
                  font-medium
                  text-[#e29a00]
                  transition
                  hover:text-[#f2b52f]
                "
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
   FEATURE COMPONENT
============================================================ */

function Feature({
  icon,
  text,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-5
      "
    >

      <span
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          text-lg
        "
      >
        {icon}
      </span>

      <span
        className="
          text-sm
          font-medium
          text-[#d0cbc1]
          sm:text-[15px]
        "
      >
        {text}
      </span>

    </div>
  )
}

export default Login