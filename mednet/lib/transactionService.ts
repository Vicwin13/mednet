import { Database } from '@/types/supabase';
import { getSupabaseClient } from './supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

/**
 * Generate a unique transaction reference
 * Format: TXN-{timestamp}-{random}
 */
export function generateTransactionRef(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}

/**
 * Create a new transaction record
 */
export async function createTransaction(
  patientId: string,
  hospitalId: string,
  amount: number
): Promise<Transaction> {
  const supabase = getSupabaseClient();
  
  const transactionRef = generateTransactionRef();
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      patient_id: patientId,
      hospital_id: hospitalId,
      amount: amount,
      status: 'pending',
      // transaction_ref will be added by user via SQL
      created_at: new Date().toISOString(),
    } as TransactionInsert)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
): Promise<Transaction> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .update({ status } as TransactionUpdate)
    .eq('id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get transactions for a patient
 */
export async function getPatientTransactions(
  patientId: string,
  limit: number = 20
): Promise<Transaction[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

/**
 * Get transactions for a hospital
 */
export async function getHospitalTransactions(
  hospitalId: string,
  limit: number = 20
): Promise<Transaction[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}
