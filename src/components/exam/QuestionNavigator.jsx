import React from 'react';

export default function QuestionNavigator({
  questions = [],
  answers = {},
  onSelectQuestion,
}) {
  const answeredCount = Object.keys(answers).filter(qId => !!answers[qId]).length;
  const total = questions.length;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-bold text-slate-800">প্রশ্ন তালিকা</h3>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-blue-700">উত্তর: {answeredCount}</span>
          <span>/</span>
          <span className="text-slate-500">বাকি: {total - answeredCount}</span>
        </div>
      </div>

      {/* Grid of questions */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const qId = q._id || q.id;
          const isAnswered = !!answers[qId];
          return (
            <button
              key={qId || idx}
              type="button"
              onClick={() => onSelectQuestion(qId)}
              className={`h-9 w-full rounded-lg font-num text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                isAnswered
                  ? 'bg-[#1c398e] text-white shadow-xs hover:bg-[#152e75]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
              title={`প্রশ্ন ${idx + 1} এ যান`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1c398e] inline-block" />
          <span>উত্তর দেওয়া</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
          <span>বাকি</span>
        </div>
      </div>
    </div>
  );
}
