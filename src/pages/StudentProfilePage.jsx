import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User, BookOpen, DollarSign, Calendar, CreditCard, FileText,
  Share2, Printer, Plus, Trash2, ArrowLeft, CheckCircle2,
  AlertTriangle, Phone, ShieldCheck, Clock, UserCheck, CalendarClock, History, Edit3, BellRing
} from 'lucide-react';
import { getStudentById, updateStudentProgress, deleteStudent } from '../services/studentService';
import { deletePayment } from '../services/paymentService';
import { getCommitmentsByStudentId } from '../services/commitmentService';
import { getNoticesByStudentId } from '../services/noticeService';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressTracker } from '../components/progress/ProgressTracker';
import { FeeSlipModal } from '../components/fee-slip/FeeSlipModal';
import { AddPaymentModal } from '../components/payments/AddPaymentModal';
import { SetCommitmentModal } from '../components/commitments/SetCommitmentModal';
import { EditStudentModal } from '../components/students/EditStudentModal';
import { FeeDueNoticeModal } from '../components/notices/FeeDueNoticeModal';
import { NoticeHistoryList } from '../components/notices/NoticeHistoryList';
import { formatCurrency, formatDate } from '../utils/feeCalculator';

export function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showFeeSlip, setShowFeeSlip] = useState(false);
  const [showFeeDueNotice, setShowFeeDueNotice] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showSetCommitment, setShowSetCommitment] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [selectedSlipPayment, setSelectedSlipPayment] = useState(null);

  const loadStudent = async () => {
    try {
      setLoading(true);
      setError('');
      const [data, commitmentList, noticeList] = await Promise.all([
        getStudentById(id),
        getCommitmentsByStudentId(id),
        getNoticesByStudentId(id)
      ]);

      if (!data) {
        setError('Student record not found.');
      } else {
        setStudent(data);
        setCommitments(commitmentList);
        setNotices(noticeList || []);
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      setError('Unable to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadStudent();
    }
  }, [id]);

  const handleUpdateProgress = async (stepUpdates) => {
    try {
      await updateStudentProgress(student.id, stepUpdates);
      await loadStudent();
    } catch (err) {
      alert('Failed to update student progress: ' + err.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record? Totals and dues will be recalculated.')) {
      return;
    }
    try {
      await deletePayment(paymentId);
      await loadStudent();
    } catch (err) {
      alert('Failed to delete payment: ' + err.message);
    }
  };

  const handleDeleteStudent = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete the profile of "${student.student_name}"? All linked payment records will also be deleted.`)) {
      return;
    }
    try {
      await deleteStudent(student.id);
      navigate('/students');
    } catch (err) {
      alert('Failed to delete student: ' + err.message);
    }
  };

  const collegeName = import.meta.env.COLLEGE_NAME || "JMT Public Higher Secondary School and College";

  const handleDirectWhatsApp = () => {
    if (!student) return;
    const isPaidInFull = student.dues === 0;
    let message = '';
    if (isPaidInFull) {
      message = `Dear ${student.student_name},\n\nYour fee payment has been received successfully.\n\nTotal Fee: ${formatCurrency(student.total_fee)}\nTotal Paid: ${formatCurrency(student.total_paid)}\nRemaining Dues: Rs.0\n\nStatus: PAID IN FULL\n\nThank you.\n${collegeName}`;
    } else {
      message = `Dear ${student.student_name},\n\nFee Summary & Commitment Update:\n\nTotal Fee: ${formatCurrency(student.total_fee)}\nTotal Paid: ${formatCurrency(student.total_paid)}\nRemaining Dues: ${formatCurrency(student.dues)}\n${student.next_payment_due_date ? `Promised / Extended Due Date: ${formatDate(student.next_payment_due_date)}\n` : ''}${student.promised_amount ? `Promised Amount: ${formatCurrency(student.promised_amount)}\n` : ''}\nThank you.\n${collegeName}`;
    }

    const cleanPhone = (student.contact_number || '').replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading student profile...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-12 max-w-xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">{error || 'Student Not Found'}</h3>
        <Link
          to="/students"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Students List</span>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{student.student_name}</h2>
            <StatusBadge status={student.fee_status} />
            {student.commitment_status && student.commitment_status !== 'None' && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                student.commitment_status === 'Fulfilled'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
              }`}>
                Commitment: {student.commitment_status}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            S/O {student.father_name} • Enrolled: {formatDate(student.created_at)}
          </p>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {student.dues > 0 && (
            <>
              <button
                onClick={() => setShowAddPayment(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all active:scale-[0.98]"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => setShowSetCommitment(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Set / Extend Commitment</span>
              </button>

              <button
                onClick={() => setShowFeeDueNotice(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Fee Due Notice</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              setSelectedSlipPayment(student.payments?.[student.payments.length - 1] || null);
              setShowFeeSlip(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Generate Fee Slip</span>
          </button>

          <button
            onClick={() => setShowEditStudent(true)}
            title="Edit Student Information & Fee"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal-400" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleDirectWhatsApp}
            title="Send WhatsApp Update"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDeleteStudent}
            title="Delete Student Profile"
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Tracker (4 official steps interactive) */}
      <ProgressTracker
        student={student}
        interactive={true}
        onUpdateStep={handleUpdateProgress}
      />

      {/* Main Grid: Student & Admission Info vs Fee Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Student and Admission details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Student Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-4 pb-3 border-b border-slate-800">
              <User className="w-4 h-4" />
              <span>Student Personal Information</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-white text-sm">{student.student_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Father Name</span>
                <span className="font-medium text-slate-200">{student.father_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gender</span>
                <span className="font-medium text-slate-200">{student.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                <span className="font-medium text-slate-200">{formatDate(student.date_of_birth)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Student CNIC / B-Form</span>
                <span className="font-mono text-slate-300">{student.student_cnic || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Father CNIC</span>
                <span className="font-mono text-slate-300">{student.father_cnic || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Number</span>
                <span className="font-mono text-slate-300 font-semibold">{student.contact_number || 'N/A'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Reference / Source</span>
                <span className="text-slate-300">{student.reference || 'Direct Admission'}</span>
              </div>
            </div>
          </div>

          {/* Section: Admission Stream & Group */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-4 pb-3 border-b border-slate-800">
              <BookOpen className="w-4 h-4" />
              <span>Admission & Academic Allocation</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Admission Session</span>
                <span className="font-semibold text-white">{student.admission_session}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Admission Type</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-teal-300 border border-slate-700">
                  {student.admission_type}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Program / Group</span>
                <span className="font-medium text-slate-200">{student.program_group}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Academic Class</span>
                <span className="font-bold text-teal-300 text-sm">{student.academic_class}</span>
              </div>
            </div>
          </div>

          {/* Section: Payment Ledger / History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Payment History & Transactions</span>
              </div>

              {student.dues > 0 && (
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Payment</span>
                </button>
              )}
            </div>

            {student.payments?.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No payment transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Receipt #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Notes</th>
                      <th className="py-2.5 px-3 text-right">Receipt / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {student.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-teal-300 font-semibold">{p.receipt_no || 'RCP-N/A'}</td>
                        <td className="py-2.5 px-3 text-slate-300">{formatDate(p.payment_date)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{p.notes || '-'}</td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSlipPayment(p);
                              setShowFeeSlip(true);
                            }}
                            title="View Fee Slip for this payment"
                            className="p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            title="Delete payment record"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Commitment & Promise Extension History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <History className="w-4 h-4" />
                <span>Payment Commitment & Extension Log</span>
              </div>

              {student.dues > 0 && (
                <button
                  onClick={() => setShowSetCommitment(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reschedule Commitment</span>
                </button>
              )}
            </div>

            {commitments.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No commitment history recorded yet. You can set a promised payment date anytime.
              </div>
            ) : (
              <div className="space-y-3">
                {commitments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">
                          Promised: {formatCurrency(c.promised_amount)}
                        </span>
                        <span className="text-slate-400">by</span>
                        <span className="font-semibold text-amber-300">
                          {formatDate(c.promised_date)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Fulfilled'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : c.status.includes('Extended') || c.status.includes('Partially')
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      {c.reason_or_notes && (
                        <p className="text-slate-400 text-[11px]">{c.reason_or_notes}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {c.paid_amount > 0 && (
                        <span className="text-emerald-400 font-semibold block text-[11px]">
                          Paid: {formatCurrency(c.paid_amount)}
                        </span>
                      )}
                      {c.extended_to_date && (
                        <span className="text-amber-300 block text-[11px]">
                          Extended to: {formatDate(c.extended_to_date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Fee Due Notices & Reminders History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <BellRing className="w-4 h-4" />
                <span>Fee Due Notices &amp; Reminders ({notices.length})</span>
              </div>
              {student.dues > 0 && (
                <button
                  onClick={() => setShowFeeDueNotice(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue New Notice</span>
                </button>
              )}
            </div>

            <NoticeHistoryList
              student={student}
              notices={notices}
              onReload={() => loadStudent()}
            />
          </div>
        </div>

        {/* Right 1 Column: Fee Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Summary</span>
              <StatusBadge status={student.fee_status} />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Total Fee</span>
                <span className="font-mono font-semibold text-white">{formatCurrency(student.total_fee)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Total Paid</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(student.total_paid)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-slate-200">Remaining Dues</span>
                <span className={`font-mono font-extrabold text-lg ${student.dues > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {formatCurrency(student.dues)}
                </span>
              </div>
            </div>

            {/* Active Commitment & Due Date Indicator */}
            {student.dues > 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                <div className="font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Next Due / Promised Date</span>
                  </span>
                  {student.promised_amount && (
                    <span className="font-bold text-white font-mono">{formatCurrency(student.promised_amount)}</span>
                  )}
                </div>

                <div className="text-sm font-bold text-white pl-5">
                  {student.next_payment_due_date ? formatDate(student.next_payment_due_date) : 'Not specified'}
                </div>

                {student.commitment_notes && (
                  <div className="text-[11px] text-amber-300/80 pl-5 italic border-t border-amber-500/20 pt-1.5 mt-1">
                    "{student.commitment_notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All tuition fees are paid in full.</span>
              </div>
            )}

            {/* Print & Share Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {student.dues > 0 && (
                <button
                  onClick={() => setShowFeeDueNotice(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
                >
                  <BellRing className="w-4 h-4 text-amber-400" />
                  <span>Fee Due Reminder Notice</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedSlipPayment(student.payments?.[student.payments.length - 1] || null);
                  setShowFeeSlip(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                <span>Print / Download Fee Slip</span>
              </button>

              <button
                onClick={handleDirectWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share Fee Slip via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Slip Modal */}
      {showFeeSlip && (
        <FeeSlipModal
          isOpen={showFeeSlip}
          onClose={() => {
            setShowFeeSlip(false);
            setSelectedSlipPayment(null);
          }}
          student={student}
          latestPayment={selectedSlipPayment}
        />
      )}

      {/* Fee Due Notice Modal */}
      {showFeeDueNotice && (
        <FeeDueNoticeModal
          isOpen={showFeeDueNotice}
          onClose={() => setShowFeeDueNotice(false)}
          student={student}
          onNoticeCreated={() => loadStudent()}
        />
      )}

      {/* Add Payment Modal */}
      {showAddPayment && (
        <AddPaymentModal
          isOpen={showAddPayment}
          onClose={() => setShowAddPayment(false)}
          student={student}
          onPaymentAdded={() => loadStudent()}
        />
      )}

      {/* Set / Reschedule Commitment Modal */}
      {showSetCommitment && (
        <SetCommitmentModal
          isOpen={showSetCommitment}
          onClose={() => setShowSetCommitment(false)}
          student={student}
          onCommitmentSaved={() => loadStudent()}
        />
      )}

      {/* Edit Student Profile Modal */}
      {showEditStudent && (
        <EditStudentModal
          isOpen={showEditStudent}
          onClose={() => setShowEditStudent(false)}
          student={student}
          onStudentUpdated={() => loadStudent()}
        />
      )}
    </div>
  );
}
