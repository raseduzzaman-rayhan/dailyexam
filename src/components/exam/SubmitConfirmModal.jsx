import React from 'react';
import Modal from '../common/Modal.jsx';
import { FiAlertCircle, FiHelpCircle } from 'react-icons/fi';

export default function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  submitting = false,
}) {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="পরীক্ষা জমা দিন" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FiHelpCircle className="text-3xl" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">
            আপনি কি পরীক্ষা জমা দিতে চান?
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            জমা দেওয়ার পর আর কোনো উত্তর পরিবর্তন করা যাবে না।
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 font-num">
          <div className="text-center p-2 rounded-lg bg-white border border-blue-100">
            <span className="text-xs text-slate-500 block font-sans">উত্তর দেওয়া হয়েছে</span>
            <span className="text-xl font-extrabold text-blue-600">{answeredCount}</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-white border border-slate-200">
            <span className="text-xs text-slate-500 block font-sans">উত্তর দেওয়া হয়নি</span>
            <span className={`text-xl font-extrabold ${unansweredCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {unansweredCount}
            </span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs">
            <FiAlertCircle className="text-base shrink-0 mt-0.5 text-amber-600" />
            <span>
              সতর্কতা: আপনার এখনো <strong>{unansweredCount}টি</strong> প্রশ্নের উত্তর দেওয়া বাকি রয়েছে।
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            ফিরে যান
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#1c398e] hover:bg-[#152e75] rounded-xl shadow-xs transition flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>ফলাফল প্রস্তুত হচ্ছে...</span>
              </>
            ) : (
              <span>হ্যাঁ, জমা দিন</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
