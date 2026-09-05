import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, DollarSign, Calendar, BookOpen, User } from 'lucide-react';
import { updateStudent } from '../../services/studentService';
import { getAdmissionConfig } from '../../services/configService';
import { formatCurrency } from '../../utils/feeCalculator';

export function EditStudentModal({ isOpen, onClose, student, onStudentUpdated }) {
  if (!isOpen || !student) return null;

  const [config, setConfig] = useState(null);
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
    admission_session: student.admission_session || 'Annual I',
    admission_type: student.admission_type || 'Regular',
    program_group: student.program_group || '',
    academic_class: student.academic_class || '',
    total_fee: student.total_fee || 0,
    next_payment_due_date: student.next_payment_due_date || ''
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getAdmissionConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load config in EditStudentModal:', err);
      }
    }
    loadConfig();
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
    const totalPaidNum = Number(student.total_paid) || 0;

    if (!formData.student_name.trim() || !formData.father_name.trim()) {
      setError('Student Name and Father Name are required.');
      return;
    }

    if (totalFeeNum < totalPaidNum) {
      setError(`Total Fee cannot be less than cumulative total paid (${formatCurrency(totalPaidNum)}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await updateStudent(student.id, {
        student_name: formData.student_name.trim(),
        father_name: formData.father_name.trim(),
        date_of_birth: formData.date_of_birth || null,
        student_cnic: formData.student_cnic.trim() || null,
        father_cnic: formData.father_cnic.trim() || null,
        gender: formData.gender,
        contact_number: formData.contact_number.trim() || null,
        reference: formData.reference.trim() || null,
        admission_session: formData.admission_session,
        admission_type: formData.admission_type,
        program_group: formData.program_group,
        academic_class: formData.academic_class,
        total_fee: totalFeeNum,
        next_payment_due_date: formData.next_payment_due_date || null
      });

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
                <label className="block text-slate-300 mb-1">Student CNIC / B-Form</label>
                <input
                  type="text"
                  value={formData.student_cnic}
                  onChange={(e) => setFormData({ ...formData, student_cnic: e.target.value })}
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
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3. Fee Details</h4>
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
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Paid to Date: <span className="text-emerald-400 font-bold">{formatCurrency(student.total_paid)}</span>
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Next Due Date</label>
                <input
                  type="date"
                  value={formData.next_payment_due_date}
                  onChange={(e) => setFormData({ ...formData, next_payment_due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
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
