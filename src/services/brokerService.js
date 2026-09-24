import { supabase } from '../lib/supabase';

/**
 * Fetch all brokers
 */
export async function getBrokers() {
  try {
    const { data, error } = await supabase
      .from('brokers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error loading brokers table:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('getBrokers exception:', err);
    return [];
  }
}

/**
 * Fetch active brokers for dropdown selection
 */
export async function getActiveBrokers() {
  try {
    const { data, error } = await supabase
      .from('brokers')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error loading active brokers:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('getActiveBrokers exception:', err);
    return [];
  }
}

/**
 * Add a new broker
 */
export async function createBroker({ name, phone = '', currentAgreedAmount = 0, notes = '' }) {
  try {
    const trimmedName = (name || '').trim();
    if (!trimmedName) throw new Error('Broker Name is required.');

    const amount = Number(currentAgreedAmount) >= 0 ? Number(currentAgreedAmount) : 0;

    const { data, error } = await supabase
      .from('brokers')
      .insert([{
        name: trimmedName,
        phone: phone ? phone.trim() : null,
        current_agreed_amount: amount,
        is_active: true,
        notes: notes ? notes.trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('createBroker error:', err);
    throw err;
  }
}

/**
 * Update an existing broker's master info and current agreed rate
 * (Note: Updating a broker's current agreed amount does NOT modify historical student snapshot amounts)
 */
export async function updateBroker(id, updates) {
  try {
    const payload = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.phone !== undefined) payload.phone = updates.phone ? updates.phone.trim() : null;
    if (updates.current_agreed_amount !== undefined) {
      payload.current_agreed_amount = Number(updates.current_agreed_amount) || 0;
    }
    if (updates.is_active !== undefined) payload.is_active = Boolean(updates.is_active);
    if (updates.notes !== undefined) payload.notes = updates.notes ? updates.notes.trim() : null;

    const { data, error } = await supabase
      .from('brokers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateBroker error:', err);
    throw err;
  }
}

/**
 * Delete a broker record
 */
export async function deleteBroker(id) {
  try {
    const { error } = await supabase
      .from('brokers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteBroker error:', err);
    throw err;
  }
}

/**
 * Fetch broker ledger & accounting summary.
 * Calculates total students and total institutional balance strictly using
 * the HISTORICAL SNAPSHOT agreed amount on each student's enrollment record.
 */
export async function getBrokerAccountingSummary() {
  try {
    const [brokersRes, studentsRes] = await Promise.all([
      getBrokers(),
      supabase
        .from('students')
        .select('id, student_name, father_name, admission_session, academic_class, program_group, created_at, admission_source, broker_id, broker_agreed_amount')
        .eq('admission_source', 'Referral')
        .order('created_at', { ascending: false })
    ]);

    const brokers = brokersRes || [];
    const referralStudents = studentsRes.data || [];

    // Aggregate summary per broker
    const brokerSummaries = brokers.map((broker) => {
      // Find all students enrolled under this broker
      const studentsForBroker = referralStudents.filter(s => s.broker_id === broker.id);

      // Total agreed amount calculated strictly from each student's individual snapshot amount
      const totalAgreedAmount = studentsForBroker.reduce(
        (sum, s) => sum + (Number(s.broker_agreed_amount) || 0),
        0
      );

      return {
        ...broker,
        total_students_count: studentsForBroker.length,
        total_snapshot_amount: totalAgreedAmount,
        students: studentsForBroker
      };
    });

    return brokerSummaries;
  } catch (err) {
    console.error('getBrokerAccountingSummary error:', err);
    throw err;
  }
}
