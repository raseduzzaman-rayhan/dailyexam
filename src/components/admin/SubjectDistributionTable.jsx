import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiPlus, FiMinus } from 'react-icons/fi';

export default function SubjectDistributionTable({
  availabilitySummary = [],
  distribution = {},
  onChangeDistribution,
  totalQuestions = 20,
  selectionMode = 'auto'
}) {
  const isAuto = selectionMode === 'auto';

  // Calculate current sum of assigned questions
  const currentTotal = Object.values(distribution).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const remaining = Number(totalQuestions) - currentTotal;

  const handleCountChange = (subject, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    onChangeDistribution({
      ...distribution,
      [subject]: num
    });
  };

  const handleIncrement = (subject) => {
    const current = Number(distribution[subject]) || 0;
    handleCountChange(subject, current + 1);
  };

  const handleDecrement = (subject) => {
    const current = Number(distribution[subject]) || 0;
    if (current > 0) {
      handleCountChange(subject, current - 1);
    }
  };

  // Quick auto-distribute helper
  const handleAutoDistribute = () => {
    const activeSubjects = availabilitySummary.filter((s) =>
      isAuto ? s.availableForAuto > 0 : s.availableForCustom > 0
    );
    if (activeSubjects.length === 0) return;

    const basePerSubj = Math.floor(Number(totalQuestions) / activeSubjects.length);
    let remainder = Number(totalQuestions) % activeSubjects.length;

    const newDist = {};
    activeSubjects.forEach((s) => {
      let alloc = basePerSubj;
      if (remainder > 0) {
        alloc += 1;
        remainder -= 1;
      }
      // Cap at available count if in auto mode
      if (isAuto && alloc > s.availableForAuto) {
        alloc = s.availableForAuto;
      }
      newDist[s.subject] = alloc;
    });

    onChangeDistribution(newDist);
  };

  return (
    <div className="space-y-4">
      {/* Header Info & Auto-Distribute */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <span className="text-xs font-bold text-slate-700 block">
            বিষয়ভিত্তিক প্রশ্ন বণ্টন
          </span>
          <span className="text-[11px] text-slate-500">
            {isAuto
              ? 'শুধুমাত্র অব্যবহৃত ও নতুন প্রশ্ন থেকে স্বয়ংক্রিয়ভাবে নির্বাচন করা হবে।'
              : 'যে যে বিষয় থেকে প্রশ্ন নিতে চান সংখ্যা উল্লেখ করুন।'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAutoDistribute}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
        >
          সমানভাবে বণ্টন করুন
        </button>
      </div>

      {/* Realtime Sum Counter Banner */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold ${
          remaining === 0
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : remaining > 0
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {remaining === 0 ? (
            <FiCheckCircle className="text-emerald-600 text-base" />
          ) : (
            <FiAlertCircle className="text-base" />
          )}
          <span>
            নির্ধারিত মোট: <strong className="font-num text-sm">{currentTotal}</strong> /{' '}
            <span className="font-num">{totalQuestions}</span> টি প্রশ্ন
          </span>
        </div>
        <div>
          {remaining === 0 && <span className="text-emerald-700">বণ্টন সম্পূর্ণ হয়েছে</span>}
          {remaining > 0 && <span>আরও {remaining}টি প্রশ্ন বণ্টন বাকি</span>}
          {remaining < 0 && <span>{Math.abs(remaining)}টি প্রশ্ন বেশি বণ্টন হয়েছে!</span>}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">বিষয়</th>
              <th className="py-3 px-3 text-center">মোট প্রশ্ন</th>
              <th className="py-3 px-3 text-center">
                {isAuto ? 'অব্যবহৃত (নতুন)' : 'উপলব্ধ প্রশ্ন'}
              </th>
              {isAuto && <th className="py-3 px-3 text-center">পূর্বে ব্যবহৃত</th>}
              <th className="py-3 px-4 text-center">প্রশ্ন সংখ্যা নির্ধারণ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {availabilitySummary.length === 0 ? (
              <tr>
                <td colSpan={isAuto ? 5 : 4} className="py-6 text-center text-slate-400">
                  প্রশ্ন ব্যাংকে কোনো বিষয় পাওয়া যায়নি। অনুগ্রহ করে আগে প্রশ্ন যুক্ত করুন।
                </td>
              </tr>
            ) : (
              availabilitySummary.map((item) => {
                const assigned = Number(distribution[item.subject]) || 0;
                const available = isAuto ? item.availableForAuto : item.availableForCustom;
                const isOverLimit = isAuto && assigned > available;

                return (
                  <tr
                    key={item.subject}
                    className={`hover:bg-slate-50/80 transition ${
                      assigned > 0 ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block text-sm">
                        {item.subject}
                      </span>
                      {isOverLimit && (
                        <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                          ⚠️ মজুদের চেয়ে বেশি ({available}টি রয়েছে)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-num text-slate-600">
                      {item.total}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-num font-bold text-[11px] ${
                          available > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {available}টি
                      </span>
                    </td>
                    {isAuto && (
                      <td className="py-3 px-3 text-center font-num text-slate-400">
                        {item.used > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px]">
                            {item.used}টি
                          </span>
                        ) : (
                          '০'
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.subject)}
                          disabled={assigned <= 0}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <FiMinus className="text-xs" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={isAuto ? item.availableForAuto : item.total}
                          value={assigned === 0 ? '' : assigned}
                          placeholder="0"
                          onChange={(e) => handleCountChange(item.subject, e.target.value)}
                          className={`w-14 text-center py-1 rounded-lg border font-num font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${
                            isOverLimit
                              ? 'border-rose-400 bg-rose-50 text-rose-700'
                              : assigned > 0
                              ? 'border-blue-300 bg-blue-50/50 text-blue-900'
                              : 'border-slate-200 text-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => handleIncrement(item.subject)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <FiPlus className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
