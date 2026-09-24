import React, { useState, useEffect } from 'react';
import { X, Handshake, User, DollarSign, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { getActiveBrokers } from '../../services/brokerService';
import { updateStudent } from '../../services/studentService';
import { formatCurrency } from '../../utils/feeCalculator';

export function AssignBrokerModal({ isOpen, onClose, student, onAssigned }) {
  if (!isOpen || !student) return null;

  const [brokers, setBrokers] = useState([]);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Mode: 'assign' | 'direct'
  const [targetMode, setTargetMode] = useState(
    student.admission_source === 'Referral' ? 'assign' : 'assign'
  );
  const [selectedBrokerId, setSelectedBrokerId] = useState(student.broker_id || '');
  const [agreedAmount, setAgreedAmount] = useState(
    student.broker_agreed_amount !== null && student.broker_agreed_amount !== undefined
      ? String(student.broker_agreed_amount)
      : ''
  );

  useEffect(() => {
    async function load() {
      try {
        setLoadingBrokers(true);
        const data = await getActiveBrokers();
        setBrokers(data || []);

        if (data && data.length > 0) {
          // If student doesn't have a broker yet, select first broker
          if (!student.broker_id) {
            setSelectedBrokerId(data[0].id);
            if (!student.broker_agreed_amount) {
              setAgreedAmount(String(data[0].current_agreed_amount || ''));
            }
          } else {
            setSelectedBrokerId(student.broker_id);
          }
        }
      } catch (err) {
        console.error('Failed to load active brokers:', err);
      } finally {
        setLoadingBrokers(false);
      }
    }
    load();
  }, [student]);

  const handleBrokerChange = (brokerId) => {
    setSelectedBrokerId(brokerId);
    const found = brokers.find(b => b.id === brokerId);
    if (found) {
      setAgreedAmount(String(found.current_agreed_amount || ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);

      if (targetMode === 'assign') {
        if (!selectedBrokerId) {
          setError('Please select a broker.');
          return;
        }

        const amountNum = Number(agreedAmount) >= 0 ? Number(agreedAmount) : 0;

        await updateStudent(student.id, {
          admission_source: 'Referral',
          broker_id: selectedBrokerId,
          broker_agreed_amount: amountNum
        });
      } else {
        // Convert to Direct
        await updateStudent(student.id, {
          admission_source: 'Direct',
          broker_id: null,
          broker_agreed_amount: null
        });
      }

      if (onAssigned) {
        onAssigned();
      }
      onClose();
    } catch (err) {
      console.error('Failed to assign broker:', err);
      setError(err.message || 'Failed to update broker allocation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBrokerName = brokers.find(b => b.id === student.broker_id)?.name || 'Referral Partner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Handshake className="w-5 h-5" />
            <span>Broker Allocation Management</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Student Status Info */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-semibold">Student Name:</span>
              <span className="text-white font-bold">{student.student_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-semibold">Current Channel:</span>
              <span className={`font-semibold ${
                student.admission_source === 'Referral' ? 'text-purple-300' : 'text-teal-300'
              }`}>
                {student.admission_source === 'Referral'
                  ? `🤝 Referral (${currentBrokerName} • ${formatCurrency(student.broker_agreed_amount || 0)})`
                  : 'Direct Student'}
              </span>
            </div>
          </div>

          {/* Action Choice Mode */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTargetMode('assign')}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                targetMode === 'assign'
                  ? 'bg-purple-950/60 text-purple-200 border-purple-500/60 ring-1 ring-purple-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>{student.admission_source === 'Referral' ? 'Change Broker' : 'Assign to Broker'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetMode('direct')}
              className={`p-2.5 rounded-xl border text-center font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                targetMode === 'direct'
                  ? 'bg-teal-950/60 text-teal-200 border-teal-500/60 ring-1 ring-teal-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Convert to Direct</span>
            </button>
          </div>

          {/* Assign Broker Form Fields */}
          {targetMode === 'assign' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Referring Broker <span className="text-rose-400">*</span>
                </label>
                <select
                  required={targetMode === 'assign'}
                  value={selectedBrokerId}
                  onChange={(e) => handleBrokerChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500 font-semibold"
                >
                  {brokers.length === 0 && (
                    <option value="">No brokers registered yet</option>
                  )}
                  {brokers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Standard: Rs. {Number(b.current_agreed_amount).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Agreed Snapshot Amount (PKR) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required={targetMode === 'assign'}
                  placeholder="e.g. 3000"
                  value={agreedAmount}
                  onChange={(e) => setAgreedAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-purple-500/50 text-purple-300 font-mono font-bold text-sm focus:outline-none focus:border-purple-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-purple-400 shrink-0 inline" />
                  <span>Permanently locked for this student; changes to broker rates will not alter this.</span>
                </span>
              </div>
            </div>
          )}

          {targetMode === 'direct' && (
            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-teal-300 text-xs">
              <p className="font-semibold">Convert to Direct Admission</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                This student will be marked as a Direct student. Any broker relationship will be removed from the broker balance ledger. Student tuition dues remain untouched.
              </p>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (targetMode === 'assign' && brokers.length === 0)}
              className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md transition-all active:scale-[0.98] ${
                targetMode === 'assign'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
                  : 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/20'
              }`}
            >
              {isSubmitting ? 'Saving...' : targetMode === 'assign' ? 'Confirm Broker Assignment' : 'Save as Direct Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
