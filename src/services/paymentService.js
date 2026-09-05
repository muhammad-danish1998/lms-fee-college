import { supabase } from '../lib/supabase';

/**
 * Add a new payment record for a student
 */
export async function addPayment({ studentId, amount, paymentDate, paymentMethod = 'Cash', notes = '' }) {
  try {
    const numAmount = Math.round(Number(amount));
    if (!numAmount || numAmount <= 0) {
      throw new Error('Payment amount must be a valid number greater than zero.');
    }

    // Verify current student dues from database before insertion
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('total_fee, payments(amount)')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      throw new Error('Could not find student record to verify payment dues.');
    }

    const totalFee = Number(student.total_fee) || 0;
    const currentPaid = (student.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const remainingDues = Math.max(0, totalFee - currentPaid);

    if (numAmount > remainingDues) {
      throw new Error(`Payment of Rs. ${numAmount.toLocaleString()} exceeds remaining dues of Rs. ${remainingDues.toLocaleString()}.`);
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
        notes: notes ? String(notes).trim().slice(0, 500) : null
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
