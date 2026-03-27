import { createLedgerEntry, getLedgerBalance, getLedgerEntries } from './ledgerService';

import { createClient } from '@supabase/supabase-js';

/**
 * Get Mednet wallet balance
 * @returns Current balance
 */
export async function getMednetBalance(): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('mednet_wallets')
    .select('balance')
    .single();

  if (error) {
    console.error('Error fetching Mednet wallet balance:', error);
    throw error;
  }

  if (!data) {
    // Create if doesn't exist
    const { data: newWallet, error: insertError } = await supabase
      .from('mednet_wallets')
      .insert({ balance: 0, currency: 'NGN', is_active: true })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating Mednet wallet:', insertError);
      throw insertError;
    }
    
    return newWallet?.balance || 0;
  }

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
    .select('balance')
    .single();

  if (fetchError) {
    console.error('Error fetching Mednet wallet:', fetchError);
    throw fetchError;
  }

  if (!data) {
    throw new Error('Mednet wallet not found');
  }

  const newBalance = type === 'credit' 
    ? data.balance + amount 
    : data.balance - amount;

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({ 
      balance: newBalance,
      updated_at: new Date().toISOString()
    });
    
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error: fetchError } = await supabase
    .from('mednet_wallets')
    .select('balance')
    .single();

  if (fetchError) {
    console.error('Error fetching Mednet wallet for funding:', fetchError);
    throw fetchError;
  }

  if (!data) {
    throw new Error('Mednet wallet not found');
  }

  // Update balance
  const newBalance = data.balance + amount;

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({ 
      balance: newBalance,
      updated_at: new Date().toISOString()
    });
    
  if (updateError) {
    console.error('Error updating Mednet wallet for funding:', updateError);
    throw updateError;
  }

  // Create ledger entry
  await createLedgerEntry(
    'mednet',
    'mednet',
    amount,
    'credit',
    transactionId,
    'Patient wallet funding'
  );
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
    .select('balance')
    .single();

  if (fetchError) {
    console.error('Error fetching Mednet wallet for payment:', fetchError);
    throw fetchError;
  }

  if (!data) {
    throw new Error('Mednet wallet not found');
  }

  // Update balance
  const newBalance = data.balance - amount;

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({ 
      balance: newBalance,
      updated_at: new Date().toISOString()
    });
    
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
    .select('balance')
    .single();

  if (fetchError) {
    console.error('Error fetching Mednet wallet for refund:', fetchError);
    throw fetchError;
  }

  if (!data) {
    throw new Error('Mednet wallet not found');
  }

  // Update balance
  const newBalance = data.balance - amount;

  const { error: updateError } = await supabase
    .from('mednet_wallets')
    .update({ 
      balance: newBalance,
      updated_at: new Date().toISOString()
    });
    
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
