import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RejectRequestRequest {
  bookingId: string;
}

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get booking details with transaction
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        transactions (*)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 2. Verify booking is in pending or accepted state
    if (booking.status !== 'pending' && booking.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Booking must be in pending or accepted state to reject' },
        { status: 400 }
      );
    }

    const amount = booking.fee || 0;

    // 3. Get patient wallet
    const { data: patientWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', booking.patient_id)
      .single();

    if (!patientWallet) {
      return NextResponse.json(
        { error: 'Patient wallet not found' },
        { status: 404 }
      );
    }

    // 4. Refund patient wallet
    await supabase
      .from('wallets')
      .update({ balance: Number(patientWallet.balance) + amount })
      .eq('user_id', booking.patient_id);

    // 5. Update transaction status
    if (booking.transactions?.[0]?.id) {
      await supabase
        .from('transactions')
        .update({ status: 'refunded' })
        .eq('id', booking.transactions[0].id);
    }

    // 6. Create ledger entry for refund
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: patientWallet.id,
        patient_id: booking.patient_id,
        transaction_type: 'refund',
        amount,
        balance_after: Number(patientWallet.balance) + amount,
        reference: `REFUND_${bookingId}`,
        description: `Refund for rejected booking ${bookingId}`,
        status: 'completed',
        metadata: {
          booking_id: bookingId,
          transaction_id: booking.transactions?.[0]?.id,
        },
      });

    // 7. Update booking status to rejected
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'rejected' })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Booking update error:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking rejected and patient refunded',
    });

  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reject request' },
      { status: 500 }
    );
  }
}
