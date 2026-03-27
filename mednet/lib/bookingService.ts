import { createLedgerEntry, refundLedgerEntry } from './ledgerService';

import { Database } from '@/types/supabase';
import { getSupabaseClient } from './supabase';
import { updateTransactionStatus } from './transactionService';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type Staff = Database['public']['Tables']['staff']['Row'];

export type BookingStatus = 'pending' | 'accepted' | 'assigned' | 'rejected' | 'completed';

export interface BookingWithDetails extends Booking {
  patient?: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
  } | null;

  hospital?: {
    id: string;
    hospitalname: string | null;
    email: string | null;
  } | null;

    transaction?: Transaction | null;

  assigned_staff?: Staff[];
}

/**
 * Create a new booking
 */
export async function createBooking(
  patientId: string,
  hospitalId: string,
  amount: number,
  transactionId: string,
  details: {
    preferredDate?: string;
    preferredTime?: string;
    medicalHistory?: string;
  }
): Promise<Booking> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      patient_id: patientId,
      hospital_id: hospitalId,
      fee: amount,
        status: 'pending',
      transaction_id: transactionId,
      created_at: new Date().toISOString(),
      // Store booking details as metadata or in separate columns
      // For now, we'll assume these columns exist or use JSON
    } as BookingInsert)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get bookings for a hospital
 */
export async function getHospitalBookings(
  hospitalId: string,
  status?: BookingStatus
): Promise<BookingWithDetails[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('bookings')
    .select(`
      *,
      patient:profiles!bookings_patient_id_fkey (
        id,
        firstname,
        lastname,
        email
      ),
      hospital:profiles!bookings_hospital_id_fkey(
        id, hospitalname, email
      ),
      transaction:transactions!bookings_transaction_id_fkey (
        id,
        amount,
        status,
        created_at
      )
    `)
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data as unknown as BookingWithDetails[]) ?? [];
}

/**
 * Get bookings for a patient
 */
export async function getPatientBookings(
  patientId: string
): Promise<BookingWithDetails[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      hospital:profiles!bookings_hospital_id_fkey (
        id,
        hospitalname,
        email
      ),
      transaction:transactions!bookings_transaction_id_fkey (
        id,
        amount,
        status,
        created_at
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as unknown as BookingWithDetails[]) ?? [];
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      patient:profiles!bookings_patient_id_fkey (
        id,
        firstname,
        lastname,
        email
      ),
      hospital:profiles!bookings_hospital_id_fkey (
        id,
        hospitalname,
        email
      ),
      transaction:transactions!bookings_transaction_id_fkey (
        id,
        amount,
        status,
        created_at
      )
    `)
    .eq('id', bookingId)
    .single();
  
  if (error) throw error;
  return (data as unknown as BookingWithDetails) ?? null;
}

/**
 * Accept a booking (hospital action)
 */
export async function acceptBooking(bookingId: string): Promise<Booking> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'accepted' } as BookingUpdate)
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Reject a booking (hospital action) - refunds patient
 */
export async function rejectBooking(
  bookingId: string,
  transactionId: string,
  patientId: string,
  amount: number
): Promise<Booking> {
  const supabase = getSupabaseClient();
  
  // Update booking status
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'rejected' } as BookingUpdate)
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update transaction status
  await updateTransactionStatus(transactionId, 'refunded');
  
  // Refund patient
  await refundLedgerEntry(transactionId, patientId, amount);
  
  return data;
}

/**
 * Assign staff to a booking
 */
export async function assignStaffToBooking(
  bookingId: string,
  staffIds: string[]
): Promise<Booking> {
  const supabase = getSupabaseClient();
  
  // Update booking with assigned staff IDs
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status: 'assigned',
      assigned_staff_id: staffIds[0] // Primary assigned staff
    } as BookingUpdate)
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Mark all assigned staff as unavailable
  await Promise.all(
    staffIds.map(staffId =>
      supabase
        .from('staff')
        .update({ active: false })
        .eq('id', staffId)
    )
  );
  
  return data;
}

/**
 * Confirm services rendered (patient action) - releases payment to hospital
 */
export async function confirmServicesRendered(
  bookingId: string,
  transactionId: string,
  hospitalId: string,
  amount: number,
  staffIds: string[]
): Promise<Booking> {
  const supabase = getSupabaseClient();
  
  // Update booking status
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'completed' } as BookingUpdate)
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update transaction status
  await updateTransactionStatus(transactionId, 'completed');
  
  // Credit hospital wallet (debit mednet-wallet)
  await createLedgerEntry(
    hospitalId,
    'hospital',
    amount,
    'credit',
    transactionId,
    'Payment for completed booking'
  );
  
  // Reactivate staff
  await Promise.all(
    staffIds.map(staffId =>
      supabase
        .from('staff')
        .update({ active: true })
        .eq('id', staffId)
    )
  );
  
  return data;
}

