import React from 'react';
import { Check, Clock, Circle, ArrowRight, CheckSquare, Square, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/feeCalculator';

export const PROGRESS_STEPS = [
  {
    id: 1,
    key: 'enrollment_verification',
    dateKey: 'enrollment_verification_date',
    label: '1. Enrollment in Verification',
    shortLabel: 'Enrollment Verification'
  },
  {
    id: 2,
    key: 'enrollment_card_issued',
    dateKey: 'enrollment_card_issued_date',
    label: '2. Enrollment Card Issued',
    shortLabel: 'Enrollment Card'
  },
  {
    id: 3,
    key: 'examination_verification',
    dateKey: 'examination_verification_date',
    label: '3. Examination in Verification',
    shortLabel: 'Exam Verification'
  },
  {
    id: 4,
    key: 'admit_card_issued',
    dateKey: 'admit_card_issued_date',
    label: '4. Admit Card Issued',
    shortLabel: 'Admit Card'
  }
];

export function ProgressTracker({ student, onUpdateStep, interactive = false, compact = false }) {
  if (!student) return null;

  const completedCount = PROGRESS_STEPS.filter(s => !!student[s.key]).length;

  // Determine current active step (next pending step)
  let nextPendingIndex = PROGRESS_STEPS.findIndex(s => !student[s.key]);
  if (nextPendingIndex === -1) nextPendingIndex = 4; // all done

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {PROGRESS_STEPS.map((step, idx) => {
          const isCompleted = !!student[step.key];
          const isNext = idx === nextPendingIndex;

          return (
            <React.Fragment key={step.key}>
              <div
                title={`${step.shortLabel}: ${isCompleted ? `Completed (${formatDate(student[step.dateKey])})` : isNext ? 'Next Active Step' : 'Pending'}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                    : isNext
                    ? 'bg-amber-400 ring-2 ring-amber-400/30 animate-pulse'
                    : 'bg-slate-700'
                }`}
              />
              {idx < PROGRESS_STEPS.length - 1 && (
                <div className={`w-3 h-0.5 ${isCompleted ? 'bg-emerald-600' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Student Verification & Exam Lifecycle</span>
            {interactive && (
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Interactive: Click to tick stages
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            4-Step official lifecycle from enrollment verification to final admit card issuance
          </p>
        </div>

        <div className={`self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-xl border ${
          completedCount === 4
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
            : completedCount > 0
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {completedCount === 4
            ? '✓ All 4 Steps Completed'
            : completedCount > 0
            ? `${completedCount} of 4 Completed`
            : '0 of 4 Completed (Enrolled)'}
        </div>
      </div>

      {/* Steps Stepper Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROGRESS_STEPS.map((step, idx) => {
          const isCompleted = !!student[step.key];
          const isNext = idx === nextPendingIndex;
          const completedDate = student[step.dateKey];

          return (
            <div
              key={step.key}
              className={`relative flex flex-col p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-sm shadow-emerald-500/5'
                  : isNext
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-100 ring-1 ring-amber-500/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-80'
              }`}
            >
              {/* Top Header of Card */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Step {step.id}
                </span>

                {interactive ? (
                  <button
                    type="button"
                    onClick={() => {
                      const willBeCompleted = !isCompleted;
                      onUpdateStep({
                        [step.key]: willBeCompleted,
                        [step.dateKey]: willBeCompleted
                          ? new Date().toISOString().split('T')[0]
                          : null
                      });
                    }}
                    title={isCompleted ? 'Click to untick / mark pending' : 'Click to tick / mark completed'}
                    className={`p-1 rounded-lg transition-transform active:scale-90 ${
                      isCompleted
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-slate-500 hover:text-teal-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Square className="w-5 h-5 stroke-[2]" />
                    )}
                  </button>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                  </div>
                )}
              </div>

              {/* Step Title */}
              <div className="font-semibold text-sm text-slate-200 mb-1 leading-snug">
                {step.shortLabel}
              </div>

              {/* Status and Action */}
              <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  {isCompleted ? (
                    <div className="text-[11px] text-emerald-400 font-medium">
                      ✓ Done {completedDate ? `(${formatDate(completedDate)})` : ''}
                    </div>
                  ) : isNext ? (
                    <div className="text-[11px] text-amber-400 font-medium animate-pulse">
                      ● Current Stage
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      ○ Pending
                    </div>
                  )}
                </div>

                {interactive && onUpdateStep && (
                  <button
                    type="button"
                    onClick={() => {
                      const willBeCompleted = !isCompleted;
                      onUpdateStep({
                        [step.key]: willBeCompleted,
                        [step.dateKey]: willBeCompleted
                          ? new Date().toISOString().split('T')[0]
                          : null
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-600/20'
                    }`}
                  >
                    {isCompleted ? 'Untick' : 'Tick Stage'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
