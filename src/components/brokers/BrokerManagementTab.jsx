import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Plus, Edit2, Trash2, Users, DollarSign, Phone, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ArrowRight, Info } from 'lucide-react';
import { getBrokers, createBroker, updateBroker, deleteBroker, getBrokerAccountingSummary } from '../../services/brokerService';
import { formatCurrency, formatDate } from '../../utils/feeCalculator';

export function BrokerManagementTab() {
  const [brokersSummary, setBrokersSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add broker form state
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newBrokerPhone, setNewBrokerPhone] = useState('');
  const [newBrokerAmount, setNewBrokerAmount] = useState('');
  const [newBrokerNotes, setNewBrokerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit broker modal state
  const [editingBroker, setEditingBroker] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [expandedBrokerId, setExpandedBrokerId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getBrokerAccountingSummary();
      setBrokersSummary(data || []);
    } catch (err) {
      console.error('Failed to load brokers summary:', err);
      setError('Failed to load referral brokers and accounting data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBroker = async (e) => {
    e.preventDefault();
    if (!newBrokerName.trim()) {
      setError('Broker Name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createBroker({
        name: newBrokerName.trim(),
        phone: newBrokerPhone.trim(),
        currentAgreedAmount: Number(newBrokerAmount) || 0,
        notes: newBrokerNotes.trim()
      });

      setNewBrokerName('');
      setNewBrokerPhone('');
      setNewBrokerAmount('');
      setNewBrokerNotes('');
      setSuccess('Referral broker added successfully.');
      setTimeout(() => setSuccess(''), 3500);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to add broker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (broker) => {
    setEditingBroker(broker);
    setEditName(broker.name || '');
    setEditPhone(broker.phone || '');
    setEditAmount(String(broker.current_agreed_amount || 0));
    setEditNotes(broker.notes || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      await updateBroker(editingBroker.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        current_agreed_amount: Number(editAmount) || 0,
        notes: editNotes.trim()
      });

      setEditingBroker(null);
      setSuccess('Broker updated successfully. Note: Historical student snapshot amounts remain safely locked.');
      setTimeout(() => setSuccess(''), 4500);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update broker.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBroker = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the broker "${name}"? Existing student records will retain their referral data.`)) {
      return;
    }

    try {
      await deleteBroker(id);
      setSuccess('Broker deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
      await loadData();
    } catch (err) {
      alert('Failed to delete broker: ' + err.message);
    }
  };

  // Overall totals
  const totalReferralStudents = brokersSummary.reduce((acc, b) => acc + (b.total_students_count || 0), 0);
  const totalSnapshotAmountSum = brokersSummary.reduce((acc, b) => acc + (b.total_snapshot_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Feedback alerts */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Brokers</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{brokersSummary.length}</span>
            <span className="text-xs text-slate-500">partners</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Referral Students</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-300">{totalReferralStudents}</span>
            <span className="text-xs text-slate-500">enrolled via brokers</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agreed Institutional Balance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatCurrency(totalSnapshotAmountSum)}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-500 mt-1">
            Calculated from student snapshot agreed rates
          </p>
        </div>
      </div>

      {/* Add New Broker Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add New Referral Broker / Partner</span>
        </h3>

        <form onSubmit={handleAddBroker} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Broker Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Broker D / Sir Aslam"
              value={newBrokerName}
              onChange={(e) => setNewBrokerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Phone / WhatsApp (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 03001234567"
              value={newBrokerPhone}
              onChange={(e) => setNewBrokerPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Standard Agreed Rate (PKR)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 3000"
              value={newBrokerAmount}
              onChange={(e) => setNewBrokerAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-teal-300 font-mono font-bold focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Broker'}
            </button>
          </div>
        </form>
      </div>

      {/* Broker List & Accounting Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Referral Partner Master &amp; Historical Balance</h3>
            <p className="text-xs text-slate-400">
              Each student holds their locked snapshot rate; future rate changes do not affect past enrollments.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading broker ledgers...
          </div>
        ) : brokersSummary.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No referral brokers registered yet. Add your first broker using the form above.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {brokersSummary.map((broker) => {
              const isExpanded = expandedBrokerId === broker.id;
              return (
                <div key={broker.id} className="p-4 space-y-3 hover:bg-slate-800/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Left: Name & Phone */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{broker.name}</span>
                        {broker.phone && (
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {broker.phone}
                          </span>
                        )}
                      </div>
                      {broker.notes && (
                        <p className="text-[11px] text-slate-400">{broker.notes}</p>
                      )}
                    </div>

                    {/* Middle: Standard Rate vs Historical Total */}
                    <div className="flex items-center gap-6">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Standard Rate</span>
                        <span className="font-mono font-bold text-slate-200">
                          {formatCurrency(broker.current_agreed_amount || 0)}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Referred Students</span>
                        <span className="font-bold text-purple-300">
                          {broker.total_students_count || 0} students
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Institutional Balance</span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {formatCurrency(broker.total_snapshot_amount || 0)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(broker)}
                          title="Edit Broker Details / Rate"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBroker(broker.id, broker.name)}
                          title="Delete Broker"
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {broker.total_students_count > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedBrokerId(isExpanded ? null : broker.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            <span>Students ({broker.total_students_count})</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Referred Students Drawer */}
                  {isExpanded && broker.students?.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs animate-fadeIn space-y-2">
                      <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <span>Referred Students for {broker.name}</span>
                        <span className="text-slate-500 text-[10px]">Snapshot rate recorded at enrollment</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-[10px] uppercase text-slate-500 font-bold border-b border-slate-800/60">
                              <th className="py-1.5 px-2">Student Name</th>
                              <th className="py-1.5 px-2">Class &amp; Stream</th>
                              <th className="py-1.5 px-2">Admission Date</th>
                              <th className="py-1.5 px-2 text-right">Agreed Snapshot Amount</th>
                              <th className="py-1.5 px-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40">
                            {broker.students.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                                <td className="py-1.5 px-2 font-semibold text-slate-200">
                                  {s.student_name} <span className="text-[10px] text-slate-400 font-normal">(S/O {s.father_name})</span>
                                </td>
                                <td className="py-1.5 px-2 text-slate-300">
                                  {s.academic_class} • {s.program_group}
                                </td>
                                <td className="py-1.5 px-2 text-slate-400 text-[11px]">
                                  {formatDate(s.created_at)}
                                </td>
                                <td className="py-1.5 px-2 text-right font-mono font-bold text-purple-300">
                                  {formatCurrency(s.broker_agreed_amount || 0)}
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  <Link
                                    to={`/students/${s.id}`}
                                    className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                                  >
                                    <span>Profile</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Broker Modal */}
      {editingBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-teal-400" />
              <span>Edit Broker Information</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Broker Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Default Agreed Rate for Future Enrollments (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-teal-300 font-mono font-bold focus:outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                  <Info className="w-3 h-3 text-teal-400 shrink-0 inline" />
                  <span>Changing this rate will NOT alter previous students' historical snapshot amounts.</span>
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBroker(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
