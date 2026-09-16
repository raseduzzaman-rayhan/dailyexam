import React from 'react';
import Modal from './Modal.jsx';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'নিশ্চিতকরণ',
  message = 'আপনি কি এই কাজটি সম্পন্ন করতে চান?',
  confirmText = 'হ্যাঁ, নিশ্চিত করুন',
  cancelText = 'বাতিল',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${
            confirmVariant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}>
            <FiAlertTriangle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-xs transition ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#1c398e] hover:bg-[#152e75]'
            }`}
          >
            {loading ? 'প্রক্রিয়াকরণ হচ্ছে...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
