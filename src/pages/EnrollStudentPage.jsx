import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User, BookOpen, DollarSign, Calendar, AlertCircle, CheckCircle2, ArrowLeft, CreditCard } from 'lucide-react';
import { createStudent } from '../services/studentService';
import { getAdmissionConfig } from '../services/configService';
import { calculateDues, formatCurrency } from '../utils/feeCalculator';

export function EnrollStudentPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    student_name: '',
    father_name: '',
    date_of_birth: '',
    student_cnic: '',
    father_cnic: '',
    gender: 'Male',
    contact_number: '',
    reference: '',
    admission_session: 'Annual I',
    admission_type: 'Regular',
    program_group: '',
    academic_class: '',
    total_fee: '',
    initial_payment: '',
    payment_method: 'Cash',
    next_payment_due_date: ''
  });

  // Load admission configuration
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoadingConfig(true);
        const data = await getAdmissionConfig();
        setConfig(data);

        // Set initial default selections based on 'Regular'
        const regularPrograms = data.programGroups['Regular'] || [];
        const regularClasses = data.academicClasses['Regular'] || [];
        setFormData(prev => ({
          ...prev,
          program_group: regularPrograms[0] || '',
          academic_class: regularClasses[0] || ''
        }));
      } catch (err) {
        console.error('Failed to load admission config:', err);
      } finally {
        setLoadingConfig(false);
      }
    }
    loadConfig();
  }, []);

  // Handle dependent dropdown updates when admission type changes
  const handleAdmissionTypeChange = (newType) => {
    if (!config) return;
    const programs = config.programGroups[newType] || [];
    const classes = config.academicClasses[newType] || [];

    setFormData(prev => ({
      ...prev,
      admission_type: newType,
      program_group: programs[0] || '',
      academic_class: classes[0] || ''
    }));
  };

  // Financial calculations
  const totalFeeNum = Number(formData.total_fee) || 0;
  const initialPaidNum = Number(formData.initial_payment) || 0;
  const duesNum = calculateDues(totalFeeNum, initialPaidNum);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations (Sections 34 & 35 of AGENTS.md)
    if (!formData.student_name.trim()) {
      setFormError('Student Name is required.');
      return;
    }
    if (!formData.father_name.trim()) {
      setFormError('Father Name is required.');
      return;
    }
    if (!formData.admission_session) {
      setFormError('Admission Session is required.');
      return;
    }
    if (!formData.admission_type) {
      setFormError('Admission Type is required.');
      return;
    }
    if (!formData.program_group) {
      setFormError('Program / Group is required.');
      return;
    }
    if (!formData.academic_class) {
      setFormError('Academic Class is required.');
      return;
    }
    if (totalFeeNum < 0) {
      setFormError('Total Fee cannot be negative.');
      return;
    }
    if (initialPaidNum < 0) {
      setFormError('Initial payment amount cannot be negative.');
      return;
    }
    if (initialPaidNum > totalFeeNum) {
      setFormError('Initial payment cannot exceed Total Fee.');
      return;
    }

    try {
      setIsSubmitting(true);
      const student = await createStudent(
        {
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
          next_payment_due_date: duesNum > 0 ? formData.next_payment_due_date || null : null
        },
        initialPaidNum > 0
          ? {
              amount: initialPaidNum,
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: formData.payment_method
            }
          : null
      );

      // Successfully saved - navigate directly to Student Profile
      navigate(`/students/${student.id}`, { state: { justEnrolled: true } });
    } catch (err) {
      console.error('Enrollment error:', err);
      setFormError(err.message || 'Failed to enroll student. Please check database connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentProgramList = config?.programGroups?.[formData.admission_type] || [];
  const currentClassList = config?.academicClasses?.[formData.admission_type] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Student Enrollment</h2>
          <p className="text-xs md:text-sm text-slate-400">
            Fill in student bio, admission stream, class allocation, and fee structure
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Student Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm uppercase tracking-wider mb-5 pb-3 border-b border-slate-800">
            <User className="w-4 h-4" />
            <span>1. Student Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmed Khan"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Father Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Khan"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Student CNIC / B-Form */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Student CNIC / B-Form
              </label>
              <input
                type="text"
                placeholder="e.g. 42101-1234567-1"
                value={formData.student_cnic}
                onChange={(e) => setFormData({ ...formData, student_cnic: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Father CNIC */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Father CNIC
              </label>
              <input
                type="text"
                placeholder="e.g. 42101-7654321-1"
                value={formData.father_cnic}
                onChange={(e) => setFormData({ ...formData, father_cnic: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Number (WhatsApp)
              </label>
              <input
                type="tel"
                placeholder="e.g. 03001234567"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reference / Recommended By
              </label>
              <input
                type="text"
                placeholder="e.g. Direct / Sir Aslam / Broker"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Admission Information */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm uppercase tracking-wider mb-5 pb-3 border-b border-slate-800">
            <BookOpen className="w-4 h-4" />
            <span>2. Admission Stream & Program</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admission Session */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admission Session <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.admission_session}
                onChange={(e) => setFormData({ ...formData, admission_session: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="Annual I">Annual I</option>
                <option value="Annual II">Annual II</option>
              </select>
            </div>

            {/* Admission Type (Triggers dependent program and class updates) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admission Type <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.admission_type}
                onChange={(e) => handleAdmissionTypeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-teal-300 font-semibold text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="Regular">Regular</option>
                <option value="Private">Private</option>
                <option value="Combine (Gap)">Combine (Gap)</option>
              </select>
            </div>

            {/* Program / Group (Dependent on Admission Type) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Program / Group <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.program_group}
                onChange={(e) => setFormData({ ...formData, program_group: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
              >
                {currentProgramList.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Filtered automatically for {formData.admission_type}
              </span>
            </div>

            {/* Academic Class (Dependent on Admission Type) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Academic Class <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.academic_class}
                onChange={(e) => setFormData({ ...formData, academic_class: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500 font-semibold"
              >
                {currentClassList.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Applicable classes for {formData.admission_type}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Fee & Payment Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm uppercase tracking-wider mb-5 pb-3 border-b border-slate-800">
            <DollarSign className="w-4 h-4" />
            <span>3. Fee Structure & Payment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Fee (PKR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 45000"
                value={formData.total_fee}
                onChange={(e) => setFormData({ ...formData, total_fee: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-base font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Initial Paid Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Payment (PKR)
              </label>
              <input
                type="number"
                min="0"
                max={totalFeeNum || undefined}
                placeholder="e.g. 10000 (or leave 0 for unpaid)"
                value={formData.initial_payment}
                onChange={(e) => setFormData({ ...formData, initial_payment: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 placeholder-slate-500 font-mono text-base font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Payment Method */}
            {initialPaidNum > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Initial Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {/* Next Due Date (if dues > 0) */}
            {duesNum > 0 && (
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                  Next Payment Due Date
                </label>
                <input
                  type="date"
                  value={formData.next_payment_due_date}
                  onChange={(e) => setFormData({ ...formData, next_payment_due_date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Automatic Dues Calculation Preview (Sections 13 & 17) */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Automatic Dues Calculation (Read-Only)</span>
              <div className="text-xs text-slate-500 mt-0.5">
                Total Fee ({formatCurrency(totalFeeNum)}) - Paid ({formatCurrency(initialPaidNum)})
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Remaining Dues</span>
                <span className={`text-xl font-extrabold font-mono ${duesNum > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatCurrency(duesNum)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Initial Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  duesNum === 0 && totalFeeNum > 0
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : initialPaidNum > 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    : 'bg-orange-950 text-orange-300 border border-orange-500/30'
                }`}>
                  {duesNum === 0 && totalFeeNum > 0 ? 'PAID IN FULL' : initialPaidNum > 0 ? 'DUE' : 'UNPAID'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Enrollment...' : 'Enroll & Save Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
