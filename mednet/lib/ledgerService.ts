import { Database } from '@/types/supabase';
import { getSupabaseClient } from './supabase';

type Ledger = Database['public']['Tables']['ledger']['Row'];
type LedgerInsert = Database['public']['Tables']['ledger']['Insert'];

export type LedgerEntryType = 'debit' | 'credit' | 'refund';
export type LedgerOwnerType = 'patient' | 'hospital' | 'mednet';

/**
 * Create a ledger entry
 * @param ownerId - ID of the owner (patient_id, hospital_id, or 'mednet' for system)
 * @param ownerType - Type of owner
 * @param amount - Amount (positive value)
 * @param entryType - Type of entry: 'debit', 'credit', or 'refund'
 * @param transactionId - Associated transaction ID
 * @param description - Description of the entry
 */
export async function createLedgerEntry(
  ownerId: string,
  ownerType: LedgerOwnerType,
  amount: number,
  entryType: LedgerEntryType,
  transactionId: string | null = null,
  description: string | null = null
): Promise<Ledger> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('ledger')
    .insert({
      owner_id: ownerId,
      owner_type: ownerType,
      amount: amount,
      entry_type: entryType,
      transaction_id: transactionId,
      description: description,
      created_at: new Date().toISOString(),
    } as LedgerInsert)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get ledger balance for an owner
 */
export async function getLedgerBalance(
  ownerId: string,
  ownerType: LedgerOwnerType
): Promise<number> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('ledger')
    .select('amount, entry_type')
    .eq('owner_id', ownerId)
    .eq('owner_type', ownerType);
  
  if (error) throw error;
  
  if (!data || data.length === 0) return 0;
  
  // Calculate balance: credits - debits
  return data.reduce((balance, entry) => {
    if (entry.entry_type === 'credit' || entry.entry_type === 'refund') {
      return balance + entry.amount;
    } else {
      return balance - entry.amount;
    }
  }, 0);
}

/**
 * Get ledger entries for an owner
 */
export async function getLedgerEntries(
  ownerId: string,
  ownerType: LedgerOwnerType,
  limit: number = 50
): Promise<Ledger[]> {
  const supabase = getSupabaseClient();
  
  // Special handling for Mednet system wallet - filter by owner_type instead of owner_id
  // This is because owner_id is UUID type in database, but 'mednet' is a string identifier
  if (ownerType === 'mednet') {
    const { data, error } = await supabase
      .from('ledger')
      .select('*')
      .eq('owner_type', ownerType)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
  
  const { data, error } = await supabase
    .from('ledger')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('owner_type', ownerType)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

/**
 * Create refund ledger entry for a transaction
 */
export async function refundLedgerEntry(
  transactionId: string,
  patientId: string,
  amount: number
): Promise<Ledger> {
  return createLedgerEntry(
    patientId,
    'patient',
    amount,
    'refund',
    transactionId,
    'Refund for rejected booking'
  );
}
