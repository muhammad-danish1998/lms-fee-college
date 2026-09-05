import React, { useState } from 'react';
import { X, Calendar, DollarSign, AlertCircle, Clock, FileText } from 'lucide-react';
import { setStudentCommitment } from '../../services/commitmentService';
import { formatCurrency } from '../../utils/feeCalculator';

export function SetCommitmentModal({ isOpen, onClose, student, onCommitmentSaved }) {
  if (!isOpen || !student) return null;

  const remainingDues = Number(student.dues) || 0;
  const [promisedAmount, setPromisedAmount] = useState(student.promised_amount || remainingDues || '');
  const [promisedDate, setPromisedDate] = useState(
    student.next_payment_due_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(student.commitment_notes || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(promisedAmount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid promised amount greater than 0.');
      return;
    }

    if (numAmount > remainingDues) {
      setError(`Promised amount cannot exceed total remaining dues of ${formatCurrency(remainingDues)}.`);
      return;
    }

    if (!promisedDate) {
      setError('Please select a valid committed payment date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await setStudentCommitment({
        studentId: student.id,
        promisedAmount: numAmount,
        promisedDate,
        notes
      });

      if (onCommitmentSaved) {
        onCommitmentSaved();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save commitment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2 text-teal-400 font-semibold">
            <Clock className="w-5 h-5" />
            <span>Set / Reschedule Fee Commitment</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Dues Info */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400">Student: <span className="font-semibold text-white">{student.student_name}</span></div>
            <div className="flex justify-between pt-1 font-semibold text-amber-300">
              <span>Total Remaining Dues:</span>
              <span>{formatCurrency(remainingDues)}</span>
            </div>
          </div>

          {/* Promised Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Promised Payment Amount (PKR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={remainingDues}
                value={promisedAmount}
                onChange={(e) => setPromisedAmount(e.target.value)}
                placeholder="e.g. 30000"
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setPromisedAmount(remainingDues.toString())}
                className="absolute right-2 top-2 px-2 py-1 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors"
              >
                All Dues
              </button>
            </div>
          </div>

          {/* Promised Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Promised Payment Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={promisedDate}
              onChange={(e) => setPromisedDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Commitment Notes / Reason for Date
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Promised to pay after father's salary on 15th"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Commitment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
