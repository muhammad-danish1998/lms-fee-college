import { supabase } from '../lib/supabase';
import { calculateTotalPaid, calculateDues, calculateFeeStatus } from '../utils/feeCalculator';
import { isValidCNIC, formatCNIC } from '../utils/cnicHelper';

/**
 * Check if a student with the given CNIC already exists in the database
 * @param {string} cnic - Student CNIC to check
 * @param {string} [excludeStudentId] - Optional student ID to exclude (used during updates)
 * @returns {Promise<Object|null>} - Existing student record if found, otherwise null
 */
export async function checkDuplicateStudentCnic(cnic, excludeStudentId = null) {
  if (!cnic || !cnic.trim()) return null;
  const formattedCnic = formatCNIC(cnic.trim());

  let query = supabase
    .from('students')
    .select('id, student_name, student_cnic, father_name, admission_session, academic_class')
    .eq('student_cnic', formattedCnic);

  if (excludeStudentId) {
    query = query.neq('id', excludeStudentId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error checking duplicate CNIC:', error);
    throw error;
  }

  return (data && data.length > 0) ? data[0] : null;
}

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
    // 0. Strict Validation of All Required Fields
    const trimmedName = (studentData.student_name || '').trim();
    const trimmedFatherName = (studentData.father_name || '').trim();
    const gender = (studentData.gender || '').trim();
    const rawCnic = (studentData.student_cnic || '').trim();
    const formattedCnic = formatCNIC(rawCnic);
    const admissionSession = (studentData.admission_session || '').trim();
    const admissionType = (studentData.admission_type || '').trim();
    const programGroup = (studentData.program_group || '').trim();
    const academicClass = (studentData.academic_class || '').trim();
    const totalFee = studentData.total_fee !== '' && studentData.total_fee !== null && studentData.total_fee !== undefined
      ? Number(studentData.total_fee)
      : NaN;

    if (!trimmedName) throw new Error('Student Name is required.');
    if (!trimmedFatherName) throw new Error('Father Name is required.');
    if (!gender) throw new Error('Gender is required.');
    if (!rawCnic) throw new Error('Student CNIC is required.');
    if (!isValidCNIC(formattedCnic)) {
      throw new Error('Student CNIC must follow the required format: XXXXX-XXXXXXX-X (13 digits).');
    }
    if (!admissionSession) throw new Error('Admission Session is required.');
    if (!admissionType) throw new Error('Admission Type is required.');
    if (!programGroup) throw new Error('Program / Group is required.');
    if (!academicClass) throw new Error('Academic Class is required.');
    if (isNaN(totalFee) || totalFee < 0) {
      throw new Error('Total Fee is required and must be a non-negative amount.');
    }

    // Check duplicate student CNIC
    const duplicate = await checkDuplicateStudentCnic(formattedCnic);
    if (duplicate) {
      throw new Error(
        `A student is already enrolled with CNIC "${formattedCnic}" (${duplicate.student_name} S/O ${duplicate.father_name} - Class: ${duplicate.academic_class}). Duplicate CNIC is not permitted.`
      );
    }

    // 1. Insert student record
    const initialDues = Math.max(0, totalFee - (Number(initialPayment?.amount) || 0));
    const hasInitialCommitment = initialDues > 0 && (studentData.next_payment_due_date || studentData.commitment_notes);

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        student_name: trimmedName,
        father_name: trimmedFatherName,
        date_of_birth: studentData.date_of_birth || null,
        student_cnic: formattedCnic,
        father_cnic: studentData.father_cnic ? formatCNIC(studentData.father_cnic) : null,
        gender: gender || 'Male',
        contact_number: studentData.contact_number || null,
        reference: studentData.reference || null,
        admission_session: admissionSession,
        admission_type: admissionType,
        program_group: programGroup,
        academic_class: academicClass,
        total_fee: totalFee,
        promised_amount: hasInitialCommitment ? (Number(studentData.promised_amount) || initialDues) : null,
        commitment_status: hasInitialCommitment ? 'Active' : (initialDues === 0 ? 'Fulfilled' : 'None'),
        commitment_notes: studentData.commitment_notes || null,
        next_payment_due_date: studentData.next_payment_due_date || null,
        enrollment_verification: false,
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

    if (studentError) {
      // Check for Postgres unique constraint violation as well
      if (studentError.code === '23505' || studentError.message?.toLowerCase().includes('unique')) {
        throw new Error(`A student with CNIC "${formattedCnic}" is already enrolled. Duplicate CNIC is not permitted.`);
      }
      throw studentError;
    }

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

    // 3. If dues remain and date or milestone was set, create the initial fee_commitments record
    if (hasInitialCommitment) {
      try {
        await supabase
          .from('fee_commitments')
          .insert([{
            student_id: student.id,
            promised_amount: Number(studentData.promised_amount) || initialDues,
            promised_date: studentData.next_payment_due_date || null,
            status: 'Active',
            reason_or_notes: studentData.commitment_notes || 'Initial admission fee commitment'
          }]);
      } catch (commitErr) {
        console.warn('Initial commitment record insert error:', commitErr);
      }
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
    const rawCnic = studentData.student_cnic ? studentData.student_cnic.trim() : '';
    const formattedCnic = rawCnic ? formatCNIC(rawCnic) : null;

    if (formattedCnic) {
      if (!isValidCNIC(formattedCnic)) {
        throw new Error('Student CNIC must follow the required format: XXXXX-XXXXXXX-X.');
      }
      const duplicate = await checkDuplicateStudentCnic(formattedCnic, id);
      if (duplicate) {
        throw new Error(`Another student is already enrolled with CNIC "${formattedCnic}" (${duplicate.student_name}).`);
      }
    }

    const { data, error } = await supabase
      .from('students')
      .update({
        student_name: studentData.student_name?.trim(),
        father_name: studentData.father_name?.trim(),
        date_of_birth: studentData.date_of_birth || null,
        student_cnic: formattedCnic,
        father_cnic: studentData.father_cnic ? formatCNIC(studentData.father_cnic) : null,
        gender: studentData.gender,
        contact_number: studentData.contact_number || null,
        reference: studentData.reference || null,
        admission_session: studentData.admission_session,
        admission_type: studentData.admission_type,
        program_group: studentData.program_group,
        academic_class: studentData.academic_class,
        total_fee: Number(studentData.total_fee) || 0,
        next_payment_due_date: studentData.next_payment_due_date || null,
        commitment_notes: studentData.commitment_notes !== undefined ? studentData.commitment_notes : undefined,
        commitment_status: studentData.commitment_status !== undefined ? studentData.commitment_status : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.toLowerCase().includes('unique')) {
        throw new Error(`Another student is already enrolled with CNIC "${formattedCnic}". Duplicate CNIC is not permitted.`);
      }
      throw error;
    }
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
