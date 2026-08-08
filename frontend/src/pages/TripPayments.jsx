import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getTrip,
} from '../services/tripService'

import {
  getTripPayment,
  saveTripPayment,
  uploadTripPaymentQR,
  getTripPaymentQRUrl,
  deleteTripPaymentQR,
} from '../services/tripPaymentService'


function TripPayments() {
  const navigate = useNavigate()

  const [trip, setTrip] =
    useState(null)

  const [payment, setPayment] =
    useState(null)

  const [form, setForm] =
    useState({
      paymentName: '',
      upiId: '',
    })

  const [qrFile, setQrFile] =
    useState(null)

  const [qrUrl, setQrUrl] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const tripId =
    localStorage.getItem(
      'tripwise-current-trip-id',
    )


  useEffect(() => {
    if (!tripId) {
      navigate('/tripwise')
      return
    }

    loadData()
  }, [tripId])


  async function loadData() {
    setLoading(true)

    try {
      const [
        tripData,
        paymentData,
      ] = await Promise.all([
        getTrip(tripId),
        getTripPayment(
          tripId,
        ),
      ])

      setTrip(tripData)
      setPayment(
        paymentData,
      )

      if (paymentData) {
        setForm({
          paymentName:
            paymentData.paymentName ||
            '',
          upiId:
            paymentData.upiId ||
            '',
        })

        if (
          paymentData.qrPath
        ) {
          try {
            const url =
              await getTripPaymentQRUrl(
                paymentData.qrPath,
              )

            setQrUrl(url)
          } catch (error) {
            console.error(
              'Unable to load QR:',
              error,
            )
          }
        }
      }
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to load payment details.',
      )
    } finally {
      setLoading(false)
    }
  }


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }


  function handleFileChange(
    event,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (
      !file.type.startsWith(
        'image/',
      )
    ) {
      setMessage(
        'Please select an image.',
      )

      return
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        'QR image must be smaller than 5 MB.',
      )

      return
    }

    setQrFile(file)

    setQrUrl(
      URL.createObjectURL(
        file,
      ),
    )
  }


  async function handleSave(
    event,
  ) {
    event.preventDefault()

    if (
      !form.paymentName.trim() &&
      !form.upiId.trim() &&
      !qrFile &&
      !payment?.qrPath
    ) {
      setMessage(
        'Add a UPI ID, payment name or QR code.',
      )

      return
    }

    setSaving(true)

    try {
      let qrPath =
        payment?.qrPath ||
        null


      /*
       * Upload a new QR if selected.
       */
      if (qrFile) {
        qrPath =
          await uploadTripPaymentQR(
            tripId,
            qrFile,
          )
      }


      const saved =
        await saveTripPayment({
          tripId,
          paymentName:
            form.paymentName,
          upiId:
            form.upiId,
          qrPath,
        })


      setPayment(saved)
      setQrFile(null)

      if (saved.qrPath) {
        const url =
          await getTripPaymentQRUrl(
            saved.qrPath,
          )

        setQrUrl(url)
      }

      setMessage(
        'Payment details saved.',
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to save payment details.',
      )
    } finally {
      setSaving(false)
    }
  }


  async function removeQR() {
    if (
      !payment?.qrPath
    ) {
      setQrFile(null)
      setQrUrl('')
      return
    }

    const confirmed =
      window.confirm(
        'Remove this QR code?',
      )

    if (!confirmed) {
      return
    }

    try {
      await deleteTripPaymentQR(
        payment.qrPath,
      )

      setPayment(
        (current) =>
          current
            ? {
                ...current,
                qrPath: '',
              }
            : current,
      )

      await saveTripPayment({
        tripId,
        paymentName:
          form.paymentName,
        upiId:
          form.upiId,
        qrPath: null,
      })

      setQrFile(null)
      setQrUrl('')

      setMessage(
        'QR code removed.',
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error?.message ||
          'Unable to remove QR code.',
      )
    }
  }


  if (loading) {
    return <PageLoading />
  }


  return (
    <div className="mx-auto max-w-5xl">

      <button
        type="button"
        onClick={() =>
          navigate('/tripwise')
        }
        className="mb-7 text-sm font-medium text-[#7c8781] hover:text-[#527d71]"
      >
        ← Back to TripWise
      </button>


      <header className="mb-8">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78968b]">
          {trip?.name}
        </p>

        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#334843] sm:text-5xl">
          Payment details
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7c8781]">
          Give everyone an easy way to send money
          to the trip leader.
        </p>

      </header>


      {message && (
        <div className="mb-6 rounded-2xl border border-[#cbded6] bg-[#eef6f2] px-4 py-3 text-sm text-[#527d71]">
          {message}
        </div>
      )}


      <form
        onSubmit={handleSave}
        className="rounded-[30px] border border-[#ddd6ca] bg-[#fffdf8] p-6 shadow-sm sm:p-9"
      >

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">


          {/* DETAILS */}

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78968b]">
              How can people pay?
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#334843]">
              Add your payment details
            </h2>


            <div className="mt-7 space-y-5">

              <Field label="Payment name">

                <input
                  type="text"
                  name="paymentName"
                  value={
                    form.paymentName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Shishir — Trip Leader"
                  className={inputClass()}
                />

              </Field>


              <Field label="UPI ID">

                <input
                  type="text"
                  name="upiId"
                  value={
                    form.upiId
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="yourname@upi"
                  className={inputClass()}
                />

              </Field>


              <div className="rounded-2xl bg-[#f2f6f3] p-4">

                <p className="text-xs font-semibold text-[#527d71]">
                  Tip
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7f8984]">
                  Add your UPI ID and QR code so
                  everyone can quickly pay their
                  share without asking for details
                  repeatedly.
                </p>

              </div>

            </div>

          </div>


          {/* QR */}

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#78968b]">
              UPI QR
            </p>

            <div className="mt-3 flex aspect-square items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-[#d4cec3] bg-[#faf8f2]">

              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="UPI QR code"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="px-6 text-center">

                  <p className="text-4xl">
                    ▦
                  </p>

                  <p className="mt-3 text-xs text-[#929b96]">
                    Upload your UPI QR code
                  </p>

                </div>
              )}

            </div>


            <div className="mt-4 space-y-2">

              <label className="block cursor-pointer rounded-xl border border-[#d8d1c5] px-4 py-3 text-center text-xs font-semibold text-[#68746f] hover:bg-[#eef5f1]">

                {qrFile
                  ? qrFile.name
                  : 'Choose QR image'}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

              </label>


              {(qrUrl ||
                payment?.qrPath) && (
                <button
                  type="button"
                  onClick={
                    removeQR
                  }
                  className="w-full rounded-xl border border-[#e3c3bd] px-4 py-2.5 text-xs font-medium text-[#a65d52]"
                >
                  Remove QR
                </button>
              )}

            </div>

          </div>

        </div>


        <div className="mt-8 flex justify-end border-t border-[#e8e1d6] pt-6">

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[#527d71] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#456c61] disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : 'Save payment details'}
          </button>

        </div>

      </form>

    </div>
  )
}


function Field({
  label,
  children,
}) {
  return (
    <label className="block">

      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7d76]">
        {label}
      </span>

      <div className="mt-2">
        {children}
      </div>

    </label>
  )
}


function inputClass() {
  return 'w-full rounded-2xl border border-[#dcd5c9] bg-[#fffdf8] px-4 py-3 text-sm text-[#334843] outline-none placeholder:text-[#a7ada9] focus:border-[#7ca194] focus:ring-4 focus:ring-[#7ca194]/10'
}


function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#d8e6e0] border-t-[#527d71]" />
    </div>
  )
}


export default TripPayments