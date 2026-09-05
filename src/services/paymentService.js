import { supabase } from '../lib/supabase';

/**
 * Add a new payment record for a student
 */
export async function addPayment({ studentId, amount, paymentDate, paymentMethod = 'Cash', notes = '' }) {
  try {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const receiptNo = `RCP-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        student_id: studentId,
        amount: numAmount,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        receipt_no: receiptNo,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('addPayment error:', err);
    throw err;
  }
}

/**
 * Get all payment records for a student
 */
export async function getPaymentsByStudentId(studentId) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('payment_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getPaymentsByStudentId error:', err);
    throw err;
  }
}

/**
 * Delete a payment record
 */
export async function deletePayment(paymentId) {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deletePayment error:', err);
    throw err;
  }
}
