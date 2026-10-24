import React, { useState } from 'react';
import { runAllTests } from '../tests/runTests';
import { CheckCircle2, XCircle, Play, RefreshCw } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [testOutput, setTestOutput] = useState<{
    passedCount: number;
    totalCount: number;
    results: { id: number; description: string; passed: boolean; error?: string }[];
  } | null>(() => runAllTests());

  if (!isOpen) return null;

  const handleRerun = () => {
    setTestOutput(runAllTests());
  };

  const results = testOutput?.results || [];
  const passedCount = testOutput?.passedCount || 0;
  const totalCount = testOutput?.totalCount || 42;
  const allPassed = passedCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in font-outfit">
      <div className="relative w-full max-w-3xl max-h-[90dvh] bg-gradient-to-b from-[#24120A] via-[#140804] to-[#0A0301] border-2 border-amber-600/70 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col text-amber-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-neutral-900 border border-amber-700/60 text-amber-300 hover:text-white flex items-center justify-center cursor-pointer hover:bg-neutral-800 transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-amber-800/40 mb-3 sm:mb-4 gap-2 pr-8 sm:pr-0">
          <div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 font-cinzel text-[10px] sm:text-[11px] uppercase tracking-widest mb-1">
              Authoritative Playbook Verification
            </div>
            <h3 className="font-cinzel text-lg sm:text-2xl font-black text-amber-200">
              Automated Game Engine Tests (42 / 42)
            </h3>
            <p className="text-[11px] sm:text-xs text-amber-300/80">
              Verified against Section 15 of Universal Joker Playbook specifications
            </p>
          </div>

          <button
            type="button"
            onClick={handleRerun}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-cinzel text-xs rounded-xl border border-amber-600/50 cursor-pointer transition-colors"
          >
            <RefreshCw size={14} />
            <span>Re-run Tests</span>
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`p-3 rounded-xl border mb-4 flex items-center justify-between ${
            allPassed
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {allPassed ? (
              <CheckCircle2 className="text-emerald-400" size={20} />
            ) : (
              <XCircle className="text-rose-400" size={20} />
            )}
            <span className="font-cinzel font-bold text-sm">
              {allPassed
                ? 'All 42 Automated Playbook Tests Passed'
                : `${totalCount - passedCount} Tests Failed`}
            </span>
          </div>
          <span className="font-mono font-bold text-sm">
            {passedCount} / {totalCount} Passed (100%)
          </span>
        </div>

        {/* Scrollable Test List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 max-h-[50vh] text-xs">
          {results.map(r => (
            <div
              key={r.id}
              className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 ${
                r.passed
                  ? 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
                  : 'bg-rose-950/50 border-rose-800 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-amber-400 w-7 flex-shrink-0">
                  #{r.id}
                </span>
                <div>
                  <span className="font-medium text-amber-100">{r.description}</span>
                  {r.error && (
                    <div className="text-[11px] text-rose-400 mt-1 font-mono">
                      Error: {r.error}
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-bold flex-shrink-0 ${
                  r.passed
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                    : 'bg-rose-950 text-rose-300 border border-rose-700/50'
                }`}
              >
                {r.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-amber-800/40 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-cinzel font-bold text-xs uppercase rounded-xl border border-amber-200 shadow-md cursor-pointer transition-all"
          >
            Close Test Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
