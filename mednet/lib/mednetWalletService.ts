import { createLedgerEntry, getLedgerBalance, getLedgerEntries } from './ledgerService';

import { createClient } from '@supabase/supabase-js';

/**
 * Get Mednet wallet balance
 * @returns Current balance
 */
export async function getMednetBalance(): Promise<number> {
  console.log('[DEBUG] getMednetBalance: Starting...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('[DEBUG] getMednetBalance: Supabase client created');
  console.log('[DEBUG] getMednetBalance: Querying mednet_wallets table...');

  const { data, error } = await supabase
    .from('mednet_wallets')
    .select('balance')
    .single();

  console.log('[DEBUG] getMednetBalance: Query result:', { data, error });

  // Handle PGRST116 error (table is empty) - create wallet
  if (error && error.code === 'PGRST116') {
    console.log('[DEBUG] getMednetBalance: Table is empty, creating new wallet...');
    
    const { data: newWallet, error: insertError } = await supabase
      .from('mednet_wallets')
      .insert({ balance: 0, currency: 'NGN', is_active: true })
      .select()
      .single();
    
    if (insertError) {
      console.error('[DEBUG] getMednetBalance: Error creating wallet:', insertError);
      throw insertError;
    }
    
    console.log('[DEBUG] getMednetBalance: Wallet created successfully:', newWallet);
    return newWallet?.balance || 0;
  }

  if (error) {
    console.error('[DEBUG] getMednetBalance: Unexpected error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }

  console.log('[DEBUG] getMednetBalance: Returning balance:', data.balance);
  return data.balance;
}

/**
 * Update Mednet wallet balance
 * @param amount - Amount to update
 * @param type - 'credit' or 'debit'
 */
export async function updateMednetBalance(amount: number, type: 'credit' | 'debit'): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error: fetchError } = await supabase
    .from('mednet_wallets')
    .select('id, balance')
    .single();

  // Handle PGRST116 error (table is empty) - create wallet first
  if (fetchError && fetchError.code === 'PGRST116') {
    console.log('[DEBUG] updateMednetBalance: Table is empty, creating new wallet...');
    
    const { error: insertError } = await supabase
      .from('mednet_wallets')
      .insert({ balance: 0, currency: 'NGN', is_active: true });
    
    if (insertError) {
      console.error('[DEBUG] updateMednetBalance: Error creating wallet:', insertError);
      throw insertError;
    }
  } else if (fetchError) {
    console.error('Error fetching Mednet wallet:', fetchError);
    throw fetchError;
  }

  const newBalance = type === 'credit'
    ? (data?.balance || 0) + amount
    : (data?.balance || 0) - amount;

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', data?.id);
    
  if (updateError) {
    console.error('Error updating Mednet wallet:', updateError);
    throw updateError;
  }
}

/**
 * Create ledger entry when patient funds wallet (money IN to Mednet)
 * @param amount - Amount being funded
 * @param transactionId - Associated transaction ID
 */
export async function recordPatientFunding(amount: number, transactionId: string): Promise<void> {
  console.log('[DEBUG] recordPatientFunding: Called with amount:', amount, 'transactionId:', transactionId);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('[DEBUG] recordPatientFunding: Fetching mednet_wallets...');
  const { data, error: fetchError } = await supabase
    .from('mednet_wallets')
    .select('id, balance')
    .single();
  
  console.log('[DEBUG] recordPatientFunding: Fetch result - data:', data, 'error:', fetchError);

  // Handle PGRST116 error (table is empty) - create wallet first
  if (fetchError && fetchError.code === 'PGRST116') {
    console.log('[DEBUG] recordPatientFunding: Table is empty, creating new wallet...');
    
    const { error: insertError } = await supabase
      .from('mednet_wallets')
      .insert({ balance: 0, currency: 'NGN', is_active: true });
    
    if (insertError) {
      console.error('[DEBUG] recordPatientFunding: Error creating wallet:', insertError);
      throw insertError;
    }
  } else if (fetchError) {
    console.error('Error fetching Mednet wallet for funding:', fetchError);
    throw fetchError;
  }

  // Update balance
  const newBalance = (data?.balance || 0) + amount;
  console.log('[DEBUG] recordPatientFunding: Updating mednet_wallets balance from', data?.balance, 'to', newBalance);

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', data?.id);
    
  if (updateError) {
    console.error('[DEBUG] recordPatientFunding: Error updating Mednet wallet for funding:', updateError);
    throw updateError;
  }
  
  console.log('[DEBUG] recordPatientFunding: Successfully updated mednet_wallets balance');

  // Create ledger entry
  console.log('[DEBUG] recordPatientFunding: Creating ledger entry...');
  await createLedgerEntry(
    'mednet',
    'mednet',
    amount,
    'credit',
    transactionId,
    'Patient wallet funding'
  );
  console.log('[DEBUG] recordPatientFunding: Successfully created ledger entry');
}

/**
 * Create ledger entry when hospital is paid (money OUT from Mednet to hospital)
 * @param amount - Amount being paid
 * @param transactionId - Associated transaction ID
 * @param hospitalName - Name of hospital receiving payment
 */
export async function recordHospitalPayment(amount: number, transactionId: string, hospitalName: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error: fetchError } = await supabase
    .from('mednet_wallets')
    .select('id, balance')
    .single();

  // Handle PGRST116 error (table is empty) - create wallet first
  if (fetchError && fetchError.code === 'PGRST116') {
    console.log('[DEBUG] recordHospitalPayment: Table is empty, creating new wallet...');
    
    const { error: insertError } = await supabase
      .from('mednet_wallets')
      .insert({ balance: 0, currency: 'NGN', is_active: true });
    
    if (insertError) {
      console.error('[DEBUG] recordHospitalPayment: Error creating wallet:', insertError);
      throw insertError;
    }
  } else if (fetchError) {
    console.error('Error fetching Mednet wallet for payment:', fetchError);
    throw fetchError;
  }

  // Update balance
  const newBalance = (data?.balance || 0) - amount;

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', data?.id);
    
  if (updateError) {
    console.error('Error updating Mednet wallet for payment:', updateError);
    throw updateError;
  }

  // Create ledger entry
  await createLedgerEntry(
    'mednet',
    'mednet',
    amount,
    'debit',
    transactionId,
    `Service payment to ${hospitalName}`
  );
}

/**
 * Create ledger entry when patient is refunded (money OUT from Mednet back to patient)
 * @param amount - Amount being refunded
 * @param transactionId - Associated transaction ID
 */
export async function recordPatientRefund(amount: number, transactionId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error: fetchError } = await supabase
    .from('mednet_wallets')
    .select('id, balance')
    .single();

  // Handle PGRST116 error (table is empty) - create wallet first
  if (fetchError && fetchError.code === 'PGRST116') {
    console.log('[DEBUG] recordPatientRefund: Table is empty, creating new wallet...');
    
    const { error: insertError } = await supabase
      .from('mednet_wallets')
      .insert({ balance: 0, currency: 'NGN', is_active: true });
    
    if (insertError) {
      console.error('[DEBUG] recordPatientRefund: Error creating wallet:', insertError);
      throw insertError;
    }
  } else if (fetchError) {
    console.error('Error fetching Mednet wallet for refund:', fetchError);
    throw fetchError;
  }

  // Update balance
  const newBalance = (data?.balance || 0) - amount;

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', data?.id);
    
  if (updateError) {
    console.error('Error updating Mednet wallet for refund:', updateError);
    throw updateError;
  }

  // Create ledger entry
  await createLedgerEntry(
    'mednet',
    'mednet',
    amount,
    'debit',
    transactionId,
    'Refund to patient'
  );
}

/**
 * Get Mednet ledger entries for transparency
 */
export async function getMednetLedgerEntries(limit: number = 50): Promise<unknown[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  return await getLedgerEntries('mednet', 'mednet', limit);
}
