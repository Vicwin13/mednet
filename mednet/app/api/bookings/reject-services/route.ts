import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { refundLedgerEntry } from '@/lib/ledgerService';

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

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify booking is in 'assigned' state
    if (booking.status !== 'assigned') {
      return NextResponse.json(
        { error: 'Booking must be in assigned state to reject services' },
        { status: 400 }
      );
    }

    // Get transaction associated with this booking
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Refund patient wallet via ledger
    await refundLedgerEntry(
      transaction.id,
      booking.patient_id,
      booking.fee || 0
    );

    // Update booking status to rejected
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'rejected' })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Services rejected and patient refunded',
      bookingStatus: 'rejected'
    });

  } catch (error) {
    console.error('Error rejecting services:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reject services' },
      { status: 500 }
    );
  }
}
