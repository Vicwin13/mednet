import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { recordHospitalPayment } from '@/lib/mednetWalletService';

// interface ConfirmServicesRequest {
//   bookingId: string;
// }

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

    // 1. Get booking details
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

    // 2. Verify booking is in assigned state
    if (booking.status !== 'assigned') {
      return NextResponse.json(
        { error: 'Booking must be in assigned state to confirm services' },
        { status: 400 }
      );
    }

    // 3. Get hospital wallet
    const { data: hospitalWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', booking.hospital_id)
      .single();

    if (!hospitalWallet) {
      return NextResponse.json(
        { error: 'Hospital wallet not found' },
        { status: 404 }
      );
    }

    const amount = booking.fee || 0;

    // 4. Debit mednet-wallet (money OUT from Mednet to hospital)
    try {
      await recordHospitalPayment(amount, `SERVICE_${bookingId}`, booking.hospital_id);
    } catch (mednetError) {
      console.error('Error debiting mednet-wallet:', mednetError);
      // Continue even if mednet-wallet fails - payment still valid
    }

    // 5. Credit hospital wallet
    await supabase
      .from('wallets')
      .update({ balance: Number(hospitalWallet.balance) + amount })
      .eq('user_id', booking.hospital_id);

    // 5. Update transaction status
    if (booking.transactions?.[0]?.id) {
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', booking.transactions[0].id);
    }

    // 6. Create ledger entry for hospital
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: hospitalWallet.id,
        patient_id: booking.patient_id,
        transaction_type: 'service_payment',
        amount,
        balance_after: Number(hospitalWallet.balance) + amount,
        reference: `SERVICE_${bookingId}`,
        description: `Service payment for booking ${bookingId}`,
        status: 'completed',
        metadata: {
          booking_id: bookingId,
          transaction_id: booking.transactions?.[0]?.id,
        },
      });

    // 7. Update booking status to completed
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
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
      message: 'Services confirmed and payment released to hospital',
    });

  } catch (error) {
    console.error('Error confirming services:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm services' },
      { status: 500 }
    );
  }
}
