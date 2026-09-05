import { supabase } from '../lib/supabase';
import { calculateTotalPaid, calculateDues, calculateFeeStatus } from '../utils/feeCalculator';

/**
 * Fetch all students with their payments
 */
export async function getStudents({ search = '', admissionType = '', admissionSession = '', programGroup = '', feeStatus = '' } = {}) {
  try {
    let query = supabase
      .from('students')
      .select(`
        *,
        payments (*)
      `)
      .order('created_at', { ascending: false });

    if (search.trim()) {
      query = query.ilike('student_name', `%${search.trim()}%`);
    }

    if (admissionSession && admissionSession !== 'All') {
      query = query.eq('admission_session', admissionSession);
    }

    if (admissionType && admissionType !== 'All') {
      query = query.eq('admission_type', admissionType);
    }

    if (programGroup && programGroup !== 'All') {
      query = query.eq('program_group', programGroup);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    // Process students with calculated financial values
    const processedStudents = (data || []).map(student => {
      const totalPaid = calculateTotalPaid(student.payments);
      const dues = calculateDues(student.total_fee, totalPaid);
      const calculatedStatus = calculateFeeStatus(student.total_fee, totalPaid, student.next_payment_due_date);

      // Determine current progress label
      let currentProgress = 'Enrolled (Verification Pending)';
      if (student.admit_card_issued) {
        currentProgress = 'Admit Card Issued';
      } else if (student.examination_verification) {
        currentProgress = 'Examination in Verification';
      } else if (student.enrollment_card_issued) {
        currentProgress = 'Enrollment Card Issued';
      } else if (student.enrollment_verification) {
        currentProgress = 'Enrollment in Verification';
      }

      return {
        ...student,
        total_paid: totalPaid,
        dues: dues,
        fee_status: calculatedStatus,
        current_progress: currentProgress
      };
    });

    // Apply fee status filter on computed values if provided
    if (feeStatus && feeStatus !== 'All') {
      return processedStudents.filter(s => s.fee_status.toLowerCase() === feeStatus.toLowerCase());
    }

    return processedStudents;
  } catch (err) {
    console.error('getStudents failed:', err);
    throw err;
  }
}

/**
 * Fetch a single student by ID with payments sorted chronologically
 */
export async function getStudentById(id) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        payments (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Sort payments chronologically
    const payments = (data.payments || []).sort(
      (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );

    const totalPaid = calculateTotalPaid(payments);
    const dues = calculateDues(data.total_fee, totalPaid);
    const feeStatus = calculateFeeStatus(data.total_fee, totalPaid, data.next_payment_due_date);

    return {
      ...data,
      payments,
      total_paid: totalPaid,
      dues,
      fee_status: feeStatus
    };
  } catch (err) {
    console.error('getStudentById error:', err);
    throw err;
  }
}

/**
 * Create a new student and optionally record the initial payment
 */
export async function createStudent(studentData, initialPayment = null) {
  try {
    // 1. Insert student record
    const initialDues = Math.max(0, (Number(studentData.total_fee) || 0) - (Number(initialPayment?.amount) || 0));
    const hasInitialCommitment = initialDues > 0 && studentData.next_payment_due_date;

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        student_name: studentData.student_name,
        father_name: studentData.father_name,
        date_of_birth: studentData.date_of_birth || null,
        student_cnic: studentData.student_cnic || null,
        father_cnic: studentData.father_cnic || null,
        gender: studentData.gender || 'Male',
        contact_number: studentData.contact_number || null,
        reference: studentData.reference || null,
        admission_session: studentData.admission_session,
        admission_type: studentData.admission_type,
        program_group: studentData.program_group,
        academic_class: studentData.academic_class,
        total_fee: Number(studentData.total_fee) || 0,
        promised_amount: hasInitialCommitment ? (Number(studentData.promised_amount) || initialDues) : null,
        commitment_status: hasInitialCommitment ? 'Active' : (initialDues === 0 ? 'Fulfilled' : 'None'),
        commitment_notes: studentData.commitment_notes || null,
        next_payment_due_date: studentData.next_payment_due_date || null,
        enrollment_verification: false, // Initial state: false until staff verifies
        enrollment_verification_date: null,
        enrollment_card_issued: false,
        enrollment_card_issued_date: null,
        examination_verification: false,
        examination_verification_date: null,
        admit_card_issued: false,
        admit_card_issued_date: null
      }])
      .select()
      .single();

    if (studentError) throw studentError;

    // 2. If initial payment provided and > 0, record payment transaction
    if (initialPayment && Number(initialPayment.amount) > 0) {
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          student_id: student.id,
          amount: Number(initialPayment.amount),
          payment_date: initialPayment.payment_date || new Date().toISOString().split('T')[0],
          payment_method: initialPayment.payment_method || 'Cash',
          receipt_no: `RCP-${Date.now().toString().slice(-6)}`,
          notes: 'Initial admission fee payment'
        }]);

      if (paymentError) {
        console.error('Payment insertion failed after student creation:', paymentError);
      }
    }

    // 3. If dues remain and date was set, create the initial fee_commitments record
    if (hasInitialCommitment) {
      await supabase
        .from('fee_commitments')
        .insert([{
          student_id: student.id,
          promised_amount: Number(studentData.promised_amount) || initialDues,
          promised_date: studentData.next_payment_due_date,
          status: 'Active',
          reason_or_notes: studentData.commitment_notes || 'Initial admission fee commitment'
        }]);
    }

    return student;
  } catch (err) {
    console.error('createStudent error:', err);
    throw err;
  }
}

/**
 * Update student general and admission details
 */
export async function updateStudent(id, studentData) {
  try {
    const { data, error } = await supabase
      .from('students')
      .update({
        student_name: studentData.student_name,
        father_name: studentData.father_name,
        date_of_birth: studentData.date_of_birth,
        student_cnic: studentData.student_cnic,
        father_cnic: studentData.father_cnic,
        gender: studentData.gender,
        contact_number: studentData.contact_number,
        reference: studentData.reference,
        admission_session: studentData.admission_session,
        admission_type: studentData.admission_type,
        program_group: studentData.program_group,
        academic_class: studentData.academic_class,
        total_fee: Number(studentData.total_fee) || 0,
        next_payment_due_date: studentData.next_payment_due_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateStudent error:', err);
    throw err;
  }
}

/**
 * Update progress tracker step
 */
export async function updateStudentProgress(id, progressUpdates) {
  try {
    const sanitized = { ...progressUpdates };
    
    const stepPairs = [
      { boolKey: 'enrollment_verification', dateKey: 'enrollment_verification_date' },
      { boolKey: 'enrollment_card_issued', dateKey: 'enrollment_card_issued_date' },
      { boolKey: 'examination_verification', dateKey: 'examination_verification_date' },
      { boolKey: 'admit_card_issued', dateKey: 'admit_card_issued_date' }
    ];

    stepPairs.forEach(({ boolKey, dateKey }) => {
      if (sanitized[boolKey] !== undefined) {
        if (!sanitized[boolKey]) {
          sanitized[dateKey] = null;
        } else if (!sanitized[dateKey] || sanitized[dateKey] === '') {
          sanitized[dateKey] = new Date().toISOString().split('T')[0];
        }
      } else if (sanitized[dateKey] === '') {
        sanitized[dateKey] = null;
      }
    });

    const { data, error } = await supabase
      .from('students')
      .update({
        ...sanitized,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('updateStudentProgress error:', err);
    throw err;
  }
}

/**
 * Delete a student (with confirmation requirement)
 */
export async function deleteStudent(id) {
  try {
    // 1. Delete linked fee commitments
    await supabase.from('fee_commitments').delete().eq('student_id', id);
    
    // 2. Delete linked payments
    await supabase.from('payments').delete().eq('student_id', id);

    // 3. Delete the student record
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteStudent error:', err);
    throw err;
  }
}
