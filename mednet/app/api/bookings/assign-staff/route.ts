import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface AssignStaffRequest {
  bookingId: string;
  staffIds: string[];
}

export async function POST(request: Request) {
  try {
    const { bookingId, staffIds } = await request.json();

    if (!bookingId || !staffIds || staffIds.length === 0) {
      return NextResponse.json(
        { error: 'bookingId and at least one staffId are required' },
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

    // 2. Verify booking is in accepted state
    if (booking.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Booking must be in accepted state to assign staff' },
        { status: 400 }
      );
    }

    // 3. Assign staff to booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'assigned',
        assigned_staff_id: staffIds[0] // Assign first staff for now
      })
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
      message: `${staffIds.length} staff member(s) assigned to booking`,
    });

  } catch (error) {
    console.error('Error assigning staff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign staff' },
      { status: 500 }
    );
  }
}
