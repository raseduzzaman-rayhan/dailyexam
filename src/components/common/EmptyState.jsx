import React from 'react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  title = 'কোনো তথ্য পাওয়া যায়নি',
  description = 'বর্তমানে প্রদর্শনের জন্য কোনো রেকর্ড নেই।',
  icon: Icon = FiInbox,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="text-3xl" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#1c398e] hover:bg-[#152e75] text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
