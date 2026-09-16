import React, { useState } from 'react';
import {
  FiRefreshCw,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAward,
  FiHelpCircle
} from 'react-icons/fi';

export default function SelectionPreviewList({
  questions = [],
  marksPerQuestion = 1,
  negativeMarks = 0,
  onRegenerateSubject,
  onRegenerateAll,
  onRemoveQuestion,
  isRegenerating = false,
  canRegenerate = true
}) {
  const [collapsedSubjects, setCollapsedSubjects] = useState({});

  const toggleSubjectCollapse = (subject) => {
    setCollapsedSubjects((prev) => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  // Group questions by subject
  const groupedQuestions = questions.reduce((acc, q) => {
    const subj = q.subject || 'সাধারণ';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(q);
    return acc;
  }, {});

  const subjectNames = Object.keys(groupedQuestions).sort((a, b) => a.localeCompare(b, 'bn'));
  const totalQuestions = questions.length;
  const calculatedTotalMarks = totalQuestions * (Number(marksPerQuestion) || 1);

  return (
    <div className="space-y-4">
      {/* Overview Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">মোট প্রশ্ন</span>
            <strong className="text-slate-800 text-sm font-num">{totalQuestions}টি</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[11px]">প্রতি প্রশ্নে নম্বর</span>
            <strong className="text-slate-800 text-sm font-num">{marksPerQuestion}</strong>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[11px]">মোট পূর্ণমান</span>
            <strong className="text-blue-700 text-sm font-num">{calculatedTotalMarks}</strong>
          </div>
          {Number(negativeMarks) > 0 && (
            <>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[11px]">নেগেটিভ মার্কিং</span>
                <strong className="text-rose-600 text-sm font-num">-{negativeMarks}</strong>
              </div>
            </>
          )}
        </div>

        {canRegenerate && onRegenerateAll && (
          <button
            type="button"
            onClick={onRegenerateAll}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <FiRefreshCw className={`text-xs ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>সব প্রশ্ন পুনরায় নির্বাচন</span>
          </button>
        )}
      </div>

      {/* Grouped Subjects Accordion */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {subjectNames.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            কোনো প্রশ্ন নির্বাচন করা হয়নি। পূর্ববর্তী ধাপে গিয়ে প্রশ্ন নির্বাচন করুন।
          </div>
        ) : (
          subjectNames.map((subject) => {
            const list = groupedQuestions[subject] || [];
            const isCollapsed = collapsedSubjects[subject];

            return (
              <div
                key={subject}
                className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs"
              >
                {/* Subject Accordion Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 border-b border-slate-100">
                  <div
                    onClick={() => toggleSubjectCollapse(subject)}
                    className="flex items-center gap-2.5 cursor-pointer flex-1"
                  >
                    <span className="text-sm font-bold text-slate-800">{subject}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-num font-bold">
                      {list.length}টি প্রশ্ন
                    </span>
                    {isCollapsed ? (
                      <FiChevronDown className="text-slate-400 text-sm" />
                    ) : (
                      <FiChevronUp className="text-slate-400 text-sm" />
                    )}
                  </div>

                  {canRegenerate && onRegenerateSubject && (
                    <button
                      type="button"
                      onClick={() => onRegenerateSubject(subject)}
                      disabled={isRegenerating}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                    >
                      <FiRefreshCw className={`text-[10px] ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>রিশাফল</span>
                    </button>
                  )}
                </div>

                {/* Questions List */}
                {!isCollapsed && (
                  <div className="p-3 space-y-2 divide-y divide-slate-100">
                    {list.map((q, idx) => {
                      const qId = String(q._id || q.id);
                      return (
                        <div key={qId} className="pt-2 first:pt-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-num font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>

                              <div className="space-y-1 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                  {q.selectionType === 'auto' ? (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                                      🤖 স্বয়ংক্রিয়
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold">
                                      ✍️ ম্যানুয়াল
                                    </span>
                                  )}

                                  {q.isPreviouslyUsed && (
                                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold">
                                      পূর্বে ব্যবহৃত
                                    </span>
                                  )}

                                  {q.topic && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                      {q.topic}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs font-semibold text-slate-800">
                                  {q.questionText || q.question}
                                </p>

                                {/* Options grid */}
                                {Array.isArray(q.options) && q.options.length > 0 && (
                                  <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-500">
                                    {q.options.slice(0, 4).map((opt, oIdx) => (
                                      <div key={oIdx} className="truncate">
                                        <span className="font-semibold text-slate-400 mr-1">
                                          {String.fromCharCode(65 + oIdx)}.
                                        </span>
                                        <span>{typeof opt === 'string' ? opt : opt.text || ''}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {onRemoveQuestion && (
                              <button
                                type="button"
                                onClick={() => onRemoveQuestion(qId)}
                                title="এই প্রশ্নটি সরান"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
