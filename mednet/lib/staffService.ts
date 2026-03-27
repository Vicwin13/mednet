import { Database } from '@/types/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

type Staff = Database['public']['Tables']['staff']['Row'];
type StaffInsert = Database['public']['Tables']['staff']['Insert'];

/**
 * Create a new staff member
 * Automatically links to authenticated hospital user
 */
export async function createStaff(staff: Omit<StaffInsert, 'id' | 'hospital_id' | 'created_at'>) {
  const supabase = getSupabaseClient();
  
  // Get authenticated user's ID (which is hospital_id)
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('staff')
    .insert([{
      full_name: staff.full_name,
      role: staff.role,
      department: staff.department,
      email: staff.email,
      phone: staff.phone || null,
      hospital_id: user.id,
    }])
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('A staff member with this email already exists');
    }
    throw error;
  }
  
  return data;
}

/**
 * Fetch all staff members for authenticated hospital
 */
export async function fetchStaffs() {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

/**
 * Update a staff member
 */
export async function updateStaff(id: string, updates: Partial<Staff>) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Delete a staff member
 */
export async function deleteStaff(id: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Subscribe to real-time staff changes
 * Returns a subscription that should be cleaned up on unmount
 */
export function subscribeToStaffChanges(
  callbacks: {
    onInsert?: (staff: Staff) => void;
    onUpdate?: (staff: Staff) => void;
    onDelete?: (id: string) => void;
  }
) {
  const supabase = getSupabaseClient();
  
  const channel = supabase
    .channel('staff-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'staff',
      },
         (payload: RealtimePostgresChangesPayload<Staff>) => {
        if (payload.eventType === 'INSERT' && callbacks.onInsert) {
          callbacks.onInsert(payload.new as Staff);
        } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
          callbacks.onUpdate(payload.new as Staff);
        } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
          callbacks.onDelete((payload.old as { id: string }).id);
        }
      }
    )
    .subscribe();
  
  return channel;
}
