import { supabase } from '../lib/supabaseClient'


async function getCurrentUser() {
  const {
    data: {
      user,
    },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error(
      'You must be signed in.',
    )
  }

  return user
}


function mapPayment(payment) {
  return {
    id: payment.id,
    tripId:
      payment.trip_id,
    paymentName:
      payment.payment_name ||
      '',
    upiId:
      payment.upi_id ||
      '',
    qrPath:
      payment.qr_path ||
      '',
    createdAt:
      payment.created_at,
    updatedAt:
      payment.updated_at,
  }
}


/*
 * Get payment details
 * for a trip.
 */
export async function getTripPayment(
  tripId,
) {
  const user =
    await getCurrentUser()

  const {
    data,
    error,
  } = await supabase
    .from('trip_payments')
    .select('*')
    .eq(
      'trip_id',
      tripId,
    )
    .eq(
      'user_id',
      user.id,
    )
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
    ? mapPayment(data)
    : null
}


/*
 * Upload QR image to
 * Supabase Storage.
 */
export async function uploadTripPaymentQR(
  tripId,
  file,
) {
  const user =
    await getCurrentUser()

  if (!file) {
    throw new Error(
      'Please select a QR image.',
    )
  }

  if (
    !file.type.startsWith(
      'image/',
    )
  ) {
    throw new Error(
      'Please upload an image file.',
    )
  }

  /*
   * Limit QR image size to 5 MB.
   */
  if (
    file.size >
    5 * 1024 * 1024
  ) {
    throw new Error(
      'QR image must be smaller than 5 MB.',
    )
  }

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'png'

  const filePath =
    `${user.id}/${tripId}/qr-${Date.now()}.${extension}`

  const {
    error,
  } = await supabase.storage
    .from('tripwise-qr')
    .upload(
      filePath,
      file,
      {
        cacheControl:
          '3600',

        upsert:
          true,

        contentType:
          file.type,
      },
    )

  if (error) {
    throw error
  }

  return filePath
}


/*
 * Generate a signed URL
 * for the private QR image.
 */
export async function getTripPaymentQRUrl(
  qrPath,
) {
  if (!qrPath) {
    return ''
  }

  const {
    data,
    error,
  } = await supabase.storage
    .from('tripwise-qr')
    .createSignedUrl(
      qrPath,
      60 * 60,
    )

  if (error) {
    throw error
  }

  return (
    data?.signedUrl || ''
  )
}


/*
 * Save payment details.
 *
 * This uses upsert because
 * each trip has only one
 * payment record.
 */
export async function saveTripPayment(
  {
    tripId,
    paymentName,
    upiId,
    qrPath,
  },
) {
  const user =
    await getCurrentUser()

  const {
    data,
    error,
  } = await supabase
    .from('trip_payments')
    .upsert(
      {
        trip_id:
          tripId,

        user_id:
          user.id,

        payment_name:
          paymentName?.trim() ||
          null,

        upi_id:
          upiId?.trim() ||
          null,

        qr_path:
          qrPath ||
          null,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          'trip_id',
      },
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapPayment(data)
}


/*
 * Delete payment details.
 */
export async function deleteTripPayment(
  tripId,
) {
  const user =
    await getCurrentUser()

  const {
    error,
  } = await supabase
    .from('trip_payments')
    .delete()
    .eq(
      'trip_id',
      tripId,
    )
    .eq(
      'user_id',
      user.id,
    )

  if (error) {
    throw error
  }
}


/*
 * Delete a QR image
 * from Supabase Storage.
 */
export async function deleteTripPaymentQR(
  qrPath,
) {
  if (!qrPath) {
    return
  }

  const {
    error,
  } = await supabase.storage
    .from('tripwise-qr')
    .remove([
      qrPath,
    ])

  if (error) {
    throw error
  }
}