import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface AcceptRequestRequest {
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

    // 1. Get booking details
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

    // 2. Verify booking is in pending state
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Booking must be in pending state to accept' },
        { status: 400 }
      );
    }

    // 3. Update booking status to accepted
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'accepted' })
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
    });

  } catch (error) {
    console.error('Error accepting request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept request' },
      { status: 500 }
    );
  }
}
