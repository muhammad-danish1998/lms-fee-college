import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Plus, FileText, CreditCard, ArrowRight, AlertTriangle, ShieldCheck, Download, Trash2, Edit3, Phone, RefreshCw, BellRing } from 'lucide-react';
import { getStudents, deleteStudent } from '../services/studentService';
import { getAdmissionConfig } from '../services/configService';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProgressTracker } from '../components/progress/ProgressTracker';
import { FeeSlipModal } from '../components/fee-slip/FeeSlipModal';
import { AddPaymentModal } from '../components/payments/AddPaymentModal';
import { ManageProgressModal } from '../components/progress/ManageProgressModal';
import { EditStudentModal } from '../components/students/EditStudentModal';
import { FeeDueNoticeModal } from '../components/notices/FeeDueNoticeModal';
import { formatCurrency, formatDate } from '../utils/feeCalculator';
import { exportStudentsToCSV } from '../utils/csvExport';

export function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [admissionType, setAdmissionType] = useState('All');
  const [admissionSession, setAdmissionSession] = useState('All');
  const [feeStatus, setFeeStatus] = useState('All');

  const [selectedStudentForSlip, setSelectedStudentForSlip] = useState(null);
  const [selectedStudentForNotice, setSelectedStudentForNotice] = useState(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentsData, configData] = await Promise.all([
        getStudents({ search, admissionType, admissionSession, feeStatus }),
        getAdmissionConfig()
      ]);
      setStudents(studentsData);
      setConfig(configData);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Unable to load student database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, admissionType, admissionSession, feeStatus]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete student "${name}"? All linked payment records will also be deleted.`)) {
      return;
    }
    try {
      await deleteStudent(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete student: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Student Directory</h2>
          <p className="text-xs md:text-sm text-slate-400">
            Search, filter, view fee statuses and manage student records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadData()}
            disabled={loading}
            title="Refresh student records"
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors active:scale-[0.98]"
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          <button
            onClick={() => exportStudentsToCSV(students, `JMT_Students_Directory_${new Date().toISOString().split('T')[0]}.csv`)}
            title="Download full fee ledger and student directory as CSV"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/enroll"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Enroll Student</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Search by Name */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Admission Type */}
          <div className="lg:col-span-3">
            <select
              value={admissionType}
              onChange={(e) => setAdmissionType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Admission Types</option>
              <option value="Regular">Regular</option>
              <option value="Private">Private</option>
              <option value="Combine (Gap)">Combine (Gap)</option>
            </select>
          </div>

          {/* Admission Session */}
          <div className="lg:col-span-3">
            <select
              value={admissionSession}
              onChange={(e) => setAdmissionSession(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="All">All Admission Sessions</option>
              <option value="Annual I">Annual I</option>
              <option value="Annual II">Annual II</option>
            </select>
          </div>

          {/* Fee Status */}
          <div className="lg:col-span-2">
            <select
              value={feeStatus}
              onChange={(e) => setFeeStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="All">All Fee Statuses</option>
              <option value="Paid in Full">Paid in Full</option>
              <option value="Due">Due</option>
              <option value="Overdue">Overdue</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table & Cards Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading students...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 text-sm">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="w-10 h-10 mx-auto text-slate-600" />
            <div className="text-base font-semibold text-slate-300">No students match your criteria</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or reset filters.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards View (shown on screens < md) */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {students.map((student) => (
                <div key={student.id} className="p-4 space-y-3 hover:bg-slate-800/30 transition-colors">
                  {/* Top: Name, Status, Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/students/${student.id}`}
                        className="font-bold text-white hover:text-teal-400 text-sm transition-colors block"
                      >
                        {student.student_name}
                      </Link>
                      <span className="text-[11px] text-slate-400 block">S/O {student.father_name}</span>
                      {student.contact_number && (
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          {student.contact_number}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge status={student.fee_status} />
                      <button
                        onClick={() => setSelectedStudentForEdit(student)}
                        title="Edit Student Profile"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id, student.student_name)}
                        title="Delete Student"
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Academic Stream Pill */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-semibold border border-slate-700">
                      {student.admission_type}
                    </span>
                    <span className="text-slate-300 font-medium">{student.program_group}</span>
                    <span className="text-teal-400 font-bold">Class {student.academic_class}</span>
                    <span className="text-slate-500">({student.admission_session})</span>
                  </div>

                  {/* Fee Numbers Grid */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Total</span>
                        <span className="text-slate-200 font-medium">{formatCurrency(student.total_fee)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Paid</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(student.total_paid)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Dues</span>
                        <span className={`font-bold ${student.dues > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {formatCurrency(student.dues)}
                        </span>
                      </div>
                    </div>

                    {student.dues > 0 && (
                      <div className="pt-1 border-t border-slate-900 text-[10.5px]">
                        {student.next_payment_due_date ? (
                          <div className="text-slate-400">
                            Due Date: <span className="font-semibold text-slate-200">{formatDate(student.next_payment_due_date)}</span>
                            {student.commitment_notes ? <span className="text-teal-400/90 ml-1">({student.commitment_notes})</span> : ''}
                          </div>
                        ) : student.commitment_notes ? (
                          <div className="text-teal-300 font-medium flex items-center gap-1">
                            <span>🎓 Due:</span>
                            <span>{student.commitment_notes}</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Progress Stepper button */}
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForProgress(student)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1"
                  >
                    <ProgressTracker student={student} compact={true} />
                    <div className="text-[10px] text-teal-400 font-medium flex items-center justify-between">
                      <span>{student.current_progress}</span>
                      <span className="text-slate-500 text-[9px]">Tap to update stage</span>
                    </div>
                  </button>

                  {/* Action Buttons Toolbar */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {student.dues > 0 && (
                      <button
                        onClick={() => setSelectedStudentForPayment(student)}
                        className="py-1.5 px-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/20 flex items-center justify-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedStudentForProgress(student)}
                      className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>Stage</span>
                    </button>
                    <button
                      onClick={() => setSelectedStudentForSlip(student)}
                      className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>Slip</span>
                    </button>
                    <Link
                      to={`/students/${student.id}`}
                      className="py-1.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View (shown on md+ screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Admission Details</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Total Fee</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Dues</th>
                    <th className="py-3.5 px-4">Status &amp; Due Date</th>
                    <th className="py-3.5 px-4">Progress Stage</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/students/${student.id}`}
                          className="font-bold text-white hover:text-teal-400 text-sm transition-colors block"
                        >
                          {student.student_name}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">Father: {student.father_name}</span>
                        {student.contact_number && (
                          <span className="text-[10px] text-slate-500 font-mono block">{student.contact_number}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-teal-300 border border-slate-700 mb-1">
                          {student.admission_type}
                        </span>
                        <div className="text-slate-300 font-medium line-clamp-1 text-[11px]">
                          {student.program_group}
                        </div>
                        <span className="text-[10px] text-slate-500">{student.admission_session}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {student.academic_class}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300 font-medium">
                        {formatCurrency(student.total_fee)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {formatCurrency(student.total_paid)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-bold ${student.dues > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {formatCurrency(student.dues)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <StatusBadge status={student.fee_status} />
                          {student.dues > 0 && (
                            student.next_payment_due_date ? (
                              <div className="text-[10px] text-slate-400">
                                Due: <span className="text-slate-200 font-medium">{formatDate(student.next_payment_due_date)}</span>
                                {student.commitment_notes && (
                                  <span className="text-teal-400/90 block text-[9.5px] line-clamp-1 mt-0.5">
                                    {student.commitment_notes}
                                  </span>
                                )}
                              </div>
                            ) : student.commitment_notes ? (
                              <div className="text-[10px] text-teal-300 font-medium line-clamp-2 max-w-[150px]">
                                🎓 {student.commitment_notes}
                              </div>
                            ) : null
                          )}
                        </div>
                      </td>

                      {/* Progress Tracker Stepper (Clickable to manage stages) */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForProgress(student)}
                          title="Click to tick / manage verification stages"
                          className="text-left space-y-1 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors w-full group/prog"
                        >
                          <ProgressTracker student={student} compact={true} />
                          <div className="flex items-center gap-1 text-[10px] text-slate-300 group-hover/prog:text-teal-300 font-medium">
                            <span className="line-clamp-1">{student.current_progress}</span>
                          </div>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {student.dues > 0 && (
                            <>
                              <button
                                onClick={() => setSelectedStudentForPayment(student)}
                                title="Record Payment"
                                className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-colors"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setSelectedStudentForNotice(student)}
                                title="Generate Fee Due Notice & Reminder"
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
                              >
                                <BellRing className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setSelectedStudentForProgress(student)}
                            title="Manage / Tick Stages"
                            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedStudentForSlip(student)}
                            title="Generate Fee Slip"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedStudentForEdit(student)}
                            title="Edit Student Profile"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(student.id, student.student_name)}
                            title="Delete Student Record"
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            to={`/students/${student.id}`}
                            title="View Complete Profile"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Fee Slip Modal */}
      {selectedStudentForSlip && (
        <FeeSlipModal
          isOpen={!!selectedStudentForSlip}
          onClose={() => setSelectedStudentForSlip(null)}
          student={selectedStudentForSlip}
          latestPayment={selectedStudentForSlip.payments?.[selectedStudentForSlip.payments.length - 1]}
        />
      )}

      {/* Fee Due Notice Modal */}
      {selectedStudentForNotice && (
        <FeeDueNoticeModal
          isOpen={!!selectedStudentForNotice}
          onClose={() => setSelectedStudentForNotice(null)}
          student={selectedStudentForNotice}
          onNoticeCreated={() => loadData()}
        />
      )}

      {/* Add Payment Modal */}
      {selectedStudentForPayment && (
        <AddPaymentModal
          isOpen={!!selectedStudentForPayment}
          onClose={() => setSelectedStudentForPayment(null)}
          student={selectedStudentForPayment}
          onPaymentAdded={() => loadData()}
        />
      )}

      {/* Manage Progress Modal */}
      {selectedStudentForProgress && (
        <ManageProgressModal
          isOpen={!!selectedStudentForProgress}
          onClose={() => setSelectedStudentForProgress(null)}
          student={selectedStudentForProgress}
          onProgressUpdated={() => loadData()}
        />
      )}

      {/* Edit Student Modal */}
      {selectedStudentForEdit && (
        <EditStudentModal
          isOpen={!!selectedStudentForEdit}
          onClose={() => setSelectedStudentForEdit(null)}
          student={selectedStudentForEdit}
          onStudentUpdated={() => loadData()}
        />
      )}
    </div>
  );
}
