import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, DollarSign, Calendar, BookOpen, User, Handshake, Info, Calculator } from 'lucide-react';
import { updateStudent, checkDuplicateStudentCnic } from '../../services/studentService';
import { adjustStudentPaidAmount } from '../../services/paymentService';
import { getAdmissionConfig } from '../../services/configService';
import { getActiveBrokers } from '../../services/brokerService';
import { formatCurrency } from '../../utils/feeCalculator';
import { formatCNIC, isValidCNIC } from '../../utils/cnicHelper';

export function EditStudentModal({ isOpen, onClose, student, onStudentUpdated }) {
  if (!isOpen || !student) return null;

  const [config, setConfig] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    student_name: student.student_name || '',
    father_name: student.father_name || '',
    date_of_birth: student.date_of_birth || '',
    student_cnic: student.student_cnic || '',
    father_cnic: student.father_cnic || '',
    gender: student.gender || 'Male',
    contact_number: student.contact_number || '',
    reference: student.reference || '',
    admission_source: student.admission_source || 'Direct',
    broker_id: student.broker_id || '',
    broker_agreed_amount: student.broker_agreed_amount !== null && student.broker_agreed_amount !== undefined ? String(student.broker_agreed_amount) : '',
    admission_session: student.admission_session || 'Annual I',
    admission_type: student.admission_type || 'Regular',
    program_group: student.program_group || '',
    academic_class: student.academic_class || '',
    total_fee: student.total_fee || 0,
    paid_amount: student.total_paid !== undefined ? String(student.total_paid) : '0',
    next_payment_due_date: student.next_payment_due_date || '',
    commitment_notes: student.commitment_notes || ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [configData, brokersData] = await Promise.all([
          getAdmissionConfig(),
          getActiveBrokers()
        ]);
        setConfig(configData);
        setBrokers(brokersData || []);
      } catch (err) {
        console.error('Failed to load config or brokers in EditStudentModal:', err);
      }
    }
    loadData();
  }, []);

  const handleAdmissionTypeChange = (newType) => {
    if (!config) return;
    const programs = config.programGroups[newType] || [];
    const classes = config.academicClasses[newType] || [];

    setFormData(prev => ({
      ...prev,
      admission_type: newType,
      program_group: programs[0] || prev.program_group,
      academic_class: classes[0] || prev.academic_class
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const totalFeeNum = Number(formData.total_fee) || 0;
    const paidNum = Number(formData.paid_amount) >= 0 ? Number(formData.paid_amount) : 0;
    const rawCnic = formData.student_cnic?.trim();

    if (!formData.student_name.trim() || !formData.father_name.trim()) {
      setError('Student Name and Father Name are required.');
      return;
    }

    if (!rawCnic) {
      setError('Student CNIC is required.');
      return;
    }

    if (!isValidCNIC(rawCnic)) {
      setError('Student CNIC must match the required pattern: XXXXX-XXXXXXX-X (13 digits).');
      return;
    }

    if (paidNum > totalFeeNum) {
      setError(`Paid amount (${formatCurrency(paidNum)}) cannot exceed Total Fee (${formatCurrency(totalFeeNum)}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await updateStudent(student.id, {
        student_name: formData.student_name.trim(),
        father_name: formData.father_name.trim(),
        date_of_birth: formData.date_of_birth || null,
        student_cnic: rawCnic,
        father_cnic: formData.father_cnic.trim() ? formatCNIC(formData.father_cnic) : null,
        gender: formData.gender,
        contact_number: formData.contact_number.trim() || null,
        reference: formData.reference.trim() || null,
        admission_source: formData.admission_source,
        broker_id: formData.admission_source === 'Referral' ? formData.broker_id : null,
        broker_agreed_amount: formData.admission_source === 'Referral' ? (Number(formData.broker_agreed_amount) || 0) : null,
        admission_session: formData.admission_session,
        admission_type: formData.admission_type,
        program_group: formData.program_group,
        academic_class: formData.academic_class,
        total_fee: totalFeeNum,
        commitment_notes: formData.commitment_notes?.trim() || null,
        next_payment_due_date: formData.next_payment_due_date || null
      });

      if (paidNum !== Number(student.total_paid || 0)) {
        await adjustStudentPaidAmount(student.id, paidNum, 'Profile Edit Fee Adjustment');
      }

      if (onStudentUpdated) {
        onStudentUpdated();
      }
      onClose();
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.message || 'Failed to update student profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrokerChange = (brokerId) => {
    const found = brokers.find(b => b.id === brokerId);
    setFormData(prev => ({
      ...prev,
      broker_id: brokerId,
      broker_agreed_amount: found ? String(found.current_agreed_amount || '') : prev.broker_agreed_amount
    }));
  };

  const currentProgramList = config?.programGroups?.[formData.admission_type] || [];
  const currentClassList = config?.academicClasses?.[formData.admission_type] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2 text-teal-400 font-semibold">
            <UserCheck className="w-5 h-5" />
            <span>Edit Student Profile Information</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admission Source Channel */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5" />
                <span>Admission Source Channel</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, admission_source: 'Direct' })}
                className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                  formData.admission_source === 'Direct'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Direct Student
              </button>

              <button
                type="button"
                onClick={() => {
                  const defaultBrokerId = formData.broker_id || (brokers[0]?.id || '');
                  const defaultBrokerAmount = formData.broker_agreed_amount || (brokers[0]?.current_agreed_amount ? String(brokers[0].current_agreed_amount) : '');
                  setFormData({
                    ...formData,
                    admission_source: 'Referral',
                    broker_id: defaultBrokerId,
                    broker_agreed_amount: defaultBrokerAmount
                  });
                }}
                className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                  formData.admission_source === 'Referral'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Referral / Broker Student
              </button>
            </div>

            {formData.admission_source === 'Referral' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Referring Broker
                  </label>
                  <select
                    value={formData.broker_id}
                    onChange={(e) => handleBrokerChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 font-medium"
                  >
                    {brokers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Standard: Rs. {Number(b.current_agreed_amount).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Snapshot Agreed Amount (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.broker_agreed_amount}
                    onChange={(e) => setFormData({ ...formData, broker_agreed_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-teal-500/40 text-teal-300 font-mono font-bold text-xs focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Personal Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Student Name *</label>
                <input
                  type="text"
                  required
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Father Name *</label>
                <input
                  type="text"
                  required
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Contact Number (WhatsApp)</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Student CNIC / B-Form *</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="42101-1234567-1"
                  value={formData.student_cnic}
                  onChange={(e) => setFormData({ ...formData, student_cnic: formatCNIC(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Father CNIC (Optional)</label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="42101-7654321-1"
                  value={formData.father_cnic}
                  onChange={(e) => setFormData({ ...formData, father_cnic: formatCNIC(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Reference / Recommended By</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Academic Allocation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Session</label>
                <select
                  value={formData.admission_session}
                  onChange={(e) => setFormData({ ...formData, admission_session: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Annual I">Annual I</option>
                  <option value="Annual II">Annual II</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Admission Type</label>
                <select
                  value={formData.admission_type}
                  onChange={(e) => handleAdmissionTypeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-teal-300 font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="Regular">Regular</option>
                  <option value="Private">Private</option>
                  <option value="Combine (Gap)">Combine (Gap)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Program / Group</label>
                <select
                  value={formData.program_group}
                  onChange={(e) => setFormData({ ...formData, program_group: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                >
                  {currentProgramList.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Academic Class</label>
                <select
                  value={formData.academic_class}
                  onChange={(e) => setFormData({ ...formData, academic_class: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-teal-500"
                >
                  {currentClassList.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fee & Dues */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3. Fee &amp; Payment Commitment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Total Course Fee (PKR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.total_fee}
                  onChange={(e) => setFormData({ ...formData, total_fee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Recorded Paid (PKR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Calculated Dues: <span className="text-amber-400 font-bold">{formatCurrency(Math.max(0, (Number(formData.total_fee) || 0) - (Number(formData.paid_amount) || 0)))}</span>
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Next Due Date (Optional)</label>
                <input
                  type="date"
                  value={formData.next_payment_due_date}
                  onChange={(e) => setFormData({ ...formData, next_payment_due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Milestone / Stage Condition (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. On Enrollment Card Issuance"
                  value={formData.commitment_notes}
                  onChange={(e) => setFormData({ ...formData, commitment_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
