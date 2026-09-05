import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, BookOpen, Layers, ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { getRawAdminConfig, addProgramGroup, deleteProgramGroup, addAcademicClass, deleteAcademicClass } from '../services/configService';
import { useAuth } from '../context/AuthContext';
import { UpdateCredentialsModal } from '../components/auth/UpdateCredentialsModal';

export function ConfigPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Form states
  const [selectedType, setSelectedType] = useState('REGULAR');
  const [newProgramName, setNewProgramName] = useState('');
  const [newClassName, setNewClassName] = useState('');

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRawAdminConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load raw config:', err);
      setError('Unable to load database stream configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    try {
      setError('');
      await addProgramGroup({
        admissionTypeCode: selectedType,
        name: newProgramName.trim()
      });
      setNewProgramName('');
      setSuccess('Program group added successfully.');
      setTimeout(() => setSuccess(''), 3000);
      await loadConfig();
    } catch (err) {
      setError(err.message || 'Failed to add program group.');
    }
  };

  const handleDeleteProgram = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the program group "${name}"?`)) return;
    try {
      await deleteProgramGroup(id);
      await loadConfig();
    } catch (err) {
      alert('Failed to delete program: ' + err.message);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      setError('');
      await addAcademicClass({
        admissionTypeCode: selectedType,
        className: newClassName.trim()
      });
      setNewClassName('');
      setSuccess('Academic class added successfully.');
      setTimeout(() => setSuccess(''), 3000);
      await loadConfig();
    } catch (err) {
      setError(err.message || 'Failed to add academic class.');
    }
  };

  const handleDeleteClass = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the class "${name}"?`)) return;
    try {
      await deleteAcademicClass(id);
      await loadConfig();
    } catch (err) {
      alert('Failed to delete class: ' + err.message);
    }
  };

  const filteredPrograms = (config?.programGroups || []).filter(
    p => p.admission_type_code === selectedType
  );

  const filteredClasses = (config?.academicClasses || []).filter(
    c => c.admission_type_code === selectedType
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Academic Streams &amp; System Settings</h2>
          <p className="text-xs md:text-sm text-slate-400">
            Manage admission streams, academic classes, and staff login credentials
          </p>
        </div>

        {/* Credentials Update Trigger */}
        <button
          onClick={() => setShowCredentialsModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors"
        >
          <KeyRound className="w-4 h-4 text-teal-400" />
          <span>Update Staff Credentials</span>
        </button>
      </div>

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

      {/* Account Info Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">{user?.full_name || 'Administrator'} ({user?.username})</div>
            <div className="text-slate-400 text-[11px]">Active account email: <span className="text-slate-200 font-mono">{user?.email}</span></div>
          </div>
        </div>
        <button
          onClick={() => setShowCredentialsModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
        >
          Change Password / Username
        </button>
      </div>

      {/* Stream Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        {[
          { code: 'REGULAR', label: 'Regular Admissions' },
          { code: 'PRIVATE', label: 'Private Admissions' },
          { code: 'COMBINE', label: 'Combine (Gap) Admissions' }
        ].map(tab => (
          <button
            key={tab.code}
            onClick={() => setSelectedType(tab.code)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === tab.code
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading academic configuration...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Program / Group Streams */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Program Groups ({filteredPrograms.length})</span>
              </div>
            </div>

            {/* Add Program Form */}
            <form onSubmit={handleAddProgram} className="flex gap-2">
              <input
                type="text"
                placeholder="New Program Name (e.g. Science General)"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors"
              >
                Add
              </button>
            </form>

            {/* Program List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredPrograms.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                >
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <button
                    onClick={() => handleDeleteProgram(p.id, p.name)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Academic Classes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Academic Classes ({filteredClasses.length})</span>
              </div>
            </div>

            {/* Add Class Form */}
            <form onSubmit={handleAddClass} className="flex gap-2">
              <input
                type="text"
                placeholder="New Class Name (e.g. XIII)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors"
              >
                Add
              </button>
            </form>

            {/* Class List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredClasses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                >
                  <span className="font-bold text-teal-300 font-mono text-sm">{c.class_name}</span>
                  <button
                    onClick={() => handleDeleteClass(c.id, c.class_name)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Update Credentials Modal */}
      {showCredentialsModal && (
        <UpdateCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
        />
      )}
    </div>
  );
}
