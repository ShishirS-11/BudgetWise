import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const CurrencyContext =
  createContext(null)

const BASE_CURRENCY = 'INR'
const DEFAULT_CURRENCY = 'INR'

const RATE_CACHE_KEY =
  'budgetwise-exchange-rates'

const RATE_CACHE_DURATION =
  6 * 60 * 60 * 1000 // 6 hours

const FALLBACK_CURRENCIES = [
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'ANG',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BMD',
  'BND',
  'BOB',
  'BRL',
  'BSD',
  'BTN',
  'BWP',
  'BYN',
  'BZD',
  'CAD',
  'CDF',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CRC',
  'CUP',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'GBP',
  'GEL',
  'GHS',
  'GIP',
  'GMD',
  'GNF',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KMF',
  'KRW',
  'KWD',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'LYD',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MRU',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SLE',
  'SOS',
  'SRD',
  'SSP',
  'STN',
  'SYP',
  'SZL',
  'THB',
  'TJS',
  'TMT',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'UYU',
  'UZS',
  'VES',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XCD',
  'XOF',
  'XPF',
  'YER',
  'ZAR',
  'ZMW',
  'ZWL',
]

function getCurrencyCodes() {
  try {
    if (
      typeof Intl.supportedValuesOf ===
      'function'
    ) {
      return Intl.supportedValuesOf(
        'currency',
      )
    }
  } catch {
    // Use fallback
  }

  return FALLBACK_CURRENCIES
}

function getCurrencyName(code) {
  try {
    if (
      typeof Intl.DisplayNames ===
      'function'
    ) {
      const names =
        new Intl.DisplayNames(
          ['en'],
          {
            type: 'currency',
          },
        )

      return names.of(code) || code
    }
  } catch {
    // Use code
  }

  return code
}

function getCurrencySymbol(code) {
  try {
    const parts =
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: code,
        currencyDisplay:
          'narrowSymbol',
      }).formatToParts(0)

    return (
      parts.find(
        (part) =>
          part.type === 'currency',
      )?.value || code
    )
  } catch {
    return code
  }
}

function readCachedRates() {
  try {
    const raw =
      localStorage.getItem(
        RATE_CACHE_KEY,
      )

    if (!raw) {
      return null
    }

    const cached = JSON.parse(raw)

    if (
      !cached.timestamp ||
      !cached.rates
    ) {
      return null
    }

    const age =
      Date.now() - cached.timestamp

    if (
      age >
      RATE_CACHE_DURATION
    ) {
      return null
    }

    return cached
  } catch {
    return null
  }
}

function saveCachedRates(
  rates,
  date,
) {
  try {
    localStorage.setItem(
      RATE_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        date,
        base: BASE_CURRENCY,
        rates,
      }),
    )
  } catch {
    // Ignore localStorage errors
  }
}

async function fetchExchangeRates() {
  const response =
    await fetch(
      `https://api.frankfurter.dev/v2/rates?base=${BASE_CURRENCY}`,
    )

  if (!response.ok) {
    throw new Error(
      'Unable to fetch exchange rates.',
    )
  }

  const data =
    await response.json()

  const rates = {
    [BASE_CURRENCY]: 1,
  }

  data.forEach((item) => {
    if (
      item.quote &&
      Number.isFinite(
        Number(item.rate),
      )
    ) {
      rates[item.quote] =
        Number(item.rate)
    }
  })

  saveCachedRates(
    rates,
    data[0]?.date || null,
  )

  return rates
}

export function CurrencyProvider({
  children,
}) {
  const [currency, setCurrencyState] =
    useState(() => {
      return (
        localStorage.getItem(
          'budgetwise-currency',
        ) ||
        DEFAULT_CURRENCY
      )
    })

  const [rates, setRates] =
    useState(() => {
      return (
        readCachedRates()?.rates || {
          INR: 1,
        }
      )
    })

  const [rateDate, setRateDate] =
    useState(() => {
      return (
        readCachedRates()?.date ||
        null
      )
    })

  const [ratesLoading, setRatesLoading] =
    useState(false)

  const [ratesError, setRatesError] =
    useState('')

  const currencies = useMemo(() => {
    return getCurrencyCodes()
      .map((code) => ({
        code,
        name: getCurrencyName(code),
        symbol:
          getCurrencySymbol(code),
      }))
      .sort((a, b) => {
        if (a.code === 'INR') {
          return -1
        }

        if (b.code === 'INR') {
          return 1
        }

        return a.name.localeCompare(
          b.name,
        )
      })
  }, [])

  useEffect(() => {
    async function loadRates() {
      const cached =
        readCachedRates()

      if (cached) {
        setRates(cached.rates)
        setRateDate(cached.date)
        return
      }

      try {
        setRatesLoading(true)
        setRatesError('')

        const freshRates =
          await fetchExchangeRates()

        setRates(freshRates)

        const saved =
          readCachedRates()

        setRateDate(
          saved?.date || null,
        )
      } catch (error) {
        console.error(
          'Exchange rate error:',
          error,
        )

        setRatesError(
          'Exchange rates are temporarily unavailable.',
        )
      } finally {
        setRatesLoading(false)
      }
    }

    loadRates()
  }, [])

  function setCurrency(code) {
    const exists =
      currencies.some(
        (item) =>
          item.code === code,
      )

    if (!exists) {
      return
    }

    setCurrencyState(code)

    localStorage.setItem(
      'budgetwise-currency',
      code,
    )
  }

  const currencyInfo =
    useMemo(() => {
      return (
        currencies.find(
          (item) =>
            item.code ===
            currency,
        ) || {
          code: 'INR',
          name: 'Indian Rupee',
          symbol: '₹',
        }
      )
    }, [
      currencies,
      currency,
    ])

  /*
   * =========================================
   * CONVERT FROM BASE INR
   * =========================================
   */

  function convertFromBase(
    amount,
  ) {
    const numericAmount =
      Number(amount || 0)

    if (
      !Number.isFinite(
        numericAmount,
      )
    ) {
      return 0
    }

    if (
      currency ===
      BASE_CURRENCY
    ) {
      return numericAmount
    }

    const rate =
      rates[currency]

    if (
      !Number.isFinite(rate)
    ) {
      return numericAmount
    }

    return numericAmount * rate
  }

  /*
   * =========================================
   * FORMAT CONVERTED AMOUNT
   * =========================================
   */

  function formatCurrency(
    amount,
    options = {},
  ) {
    const converted =
      convertFromBase(amount)

    try {
      return new Intl.NumberFormat(
        'en-IN',
        {
          style: 'currency',
          currency,
          maximumFractionDigits:
            options.maximumFractionDigits ??
            2,
          minimumFractionDigits:
            options.minimumFractionDigits ??
            0,
          ...options,
        },
      ).format(converted)
    } catch {
      return `${currencyInfo.symbol}${converted.toLocaleString(
        'en-IN',
        {
          maximumFractionDigits: 2,
        },
      )}`
    }
  }

  /*
   * =========================================
   * RAW CONVERTED NUMBER
   * =========================================
   */

  function convertAmount(amount) {
    return convertFromBase(amount)
  }

  /*
   * =========================================
   * RATE
   * =========================================
   */

  const currentRate =
    currency === BASE_CURRENCY
      ? 1
      : rates[currency] || null

  useEffect(() => {
    document.documentElement.dataset.currency =
      currency
  }, [currency])

  const value = useMemo(
    () => ({
      baseCurrency:
        BASE_CURRENCY,

      currency,

      setCurrency,

      currencies,

      currencyInfo,

      rates,

      currentRate,

      rateDate,

      ratesLoading,

      ratesError,

      convertAmount,

      formatCurrency,
    }),
    [
      currency,
      currencies,
      currencyInfo,
      rates,
      currentRate,
      rateDate,
      ratesLoading,
      ratesError,
    ],
  )

  return (
    <CurrencyContext.Provider
      value={value}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context =
    useContext(
      CurrencyContext,
    )

  if (!context) {
    throw new Error(
      'useCurrency must be used inside CurrencyProvider.',
    )
  }

  return context
}

export default CurrencyContext