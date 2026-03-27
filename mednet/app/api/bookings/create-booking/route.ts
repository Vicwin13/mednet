import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { patientId, hospitalId, amount, preferredDate, preferredTime, medicalHistory } = await request.json();

    if (!patientId || !hospitalId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, hospitalId and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Check patient wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', patientId)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (Number(wallet.balance) < amount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    // 2. Deduct from patient wallet
    await supabase
      .from('wallets')
      .update({ balance: Number(wallet.balance) - amount })
      .eq('user_id', patientId);

    // 3. Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        patient_id: patientId,
        hospital_id: hospitalId,
        amount,
        status: 'pending',
      })
      .select()
      .single();

    if (transactionError) {
      // Refund wallet
      await supabase
        .from('wallets')
        .update({ balance: Number(wallet.balance) })
        .eq('user_id', patientId);
      console.error('Transaction insert error:', transactionError);
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    // 4. Create ledger entry
    const { error: ledgerError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        patient_id: patientId,
        transaction_type: 'booking_payment',
        amount,
        balance_after: Number(wallet.balance) - amount,
        reference: `BOOKING_${transaction.id}`,
        description: `Booking payment for hospital ${hospitalId}`,
        status: 'completed',
        metadata: {
          transaction_id: transaction.id,
          hospital_id: hospitalId,
        },
      });

    if (ledgerError) {
      console.error('Ledger insert error:', ledgerError);
      // Continue even if ledger fails — booking still valid
    }

    // 5. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        patient_id: patientId,
        hospital_id: hospitalId,
        fee: amount,
        status: 'pending',
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        medical_history: medicalHistory,
      })
      .select()
      .single();

    if (bookingError) {
      // Refund wallet
      await supabase
        .from('wallets')
        .update({ balance: Number(wallet.balance) })
        .eq('user_id', patientId);
      console.error('Booking insert error:', bookingError);
      return NextResponse.json({ error: bookingError.message, details: bookingError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      transactionRef: booking.id,
      transactionId: transaction.id,
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create booking' },
      { status: 500 }
    );
  }
}
