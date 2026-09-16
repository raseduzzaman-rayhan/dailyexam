import React from 'react';
import { FiCheck, FiXCircle } from 'react-icons/fi';

export default function QuestionCard({
  question,
  questionIndex,
  selectedOption,
  onSelectOption,
  onClearOption,
}) {
  const qId = question._id || question.id;
  const options = question.options || [];
  const qText = question.questionText || question.question;

  return (
    <div
      id={`question-${qId}`}
      className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 scroll-mt-24 shadow-xs ${
        selectedOption
          ? 'border-blue-400 ring-1 ring-blue-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#1c398e] text-white font-num">
            প্রশ্ন {questionIndex + 1}
          </span>
          {question.subject && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {question.subject}
            </span>
          )}
          {question.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
              {question.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedOption ? (
            <button
              onClick={() => onClearOption(qId)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition"
              title="উত্তর মুছে ফেলুন"
            >
              <FiXCircle />
              <span className="hidden sm:inline">মুছুন</span>
            </button>
          ) : (
            <span className="text-xs text-amber-600 font-medium">অনুত্তরিত</span>
          )}
        </div>
      </div>

      {/* Question Text in Kalpurush font */}
      <div className="text-lg sm:text-xl font-normal text-slate-900 leading-relaxed mb-5 font-kalpurush tracking-wide">
        {qText}
      </div>

      {/* Options (A, B, C, D) in Kalpurush font */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectOption(qId, opt.id)}
              className={`group flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-200'
                  : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Radio Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all font-num ${
                  isSelected
                    ? 'bg-[#1c398e] text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-600 group-hover:border-blue-400'
                }`}
              >
                {opt.id}
              </div>

              {/* Option Text */}
              <span
                className={`text-base sm:text-lg font-normal leading-snug pt-0.5 font-kalpurush ${
                  isSelected ? 'text-blue-950 font-medium' : 'text-slate-700'
                }`}
              >
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
