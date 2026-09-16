import React, { useState, useMemo } from 'react';
import { FiSearch, FiCheck, FiAlertTriangle, FiTrash2, FiInfo } from 'react-icons/fi';

export default function CustomQuestionPicker({
  questions = [],
  selectedQuestionIds = [],
  onToggleQuestion,
  onRemoveQuestion,
  subjectFilter = '',
  maxQuestions = null
}) {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjectFilter || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [confirmModalData, setConfirmModalData] = useState(null); // question object to confirm

  const subjects = useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.subject).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'bn')
    );
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const textMatch =
        !search ||
        (q.questionText && q.questionText.toLowerCase().includes(search.toLowerCase())) ||
        (q.question && q.question.toLowerCase().includes(search.toLowerCase())) ||
        (q.topic && q.topic.toLowerCase().includes(search.toLowerCase()));

      const subjectMatch =
        selectedSubject === 'all' || (q.subject && q.subject === selectedSubject);

      const diffMatch =
        selectedDifficulty === 'all' || (q.difficulty && q.difficulty === selectedDifficulty);

      return textMatch && subjectMatch && diffMatch;
    });
  }, [questions, search, selectedSubject, selectedDifficulty]);

  const handleCardClick = (q) => {
    const qId = String(q._id || q.id);
    const isAlreadySelected = selectedQuestionIds.some((id) => String(id) === qId);

    if (isAlreadySelected) {
      // Direct deselect
      onToggleQuestion(qId);
      return;
    }

    // If running in active exam: completely blocked
    if (q.isRunning) {
      return;
    }

    // Check if previously used in published/closed exams
    if (q.isUsed || q.usageCount > 0) {
      setConfirmModalData(q);
      return;
    }

    // Regular unused question - directly select
    onToggleQuestion(qId);
  };

  const handleConfirmUsedSelection = () => {
    if (confirmModalData) {
      const qId = String(confirmModalData._id || confirmModalData.id);
      onToggleQuestion(qId);
      setConfirmModalData(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-3 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="প্রশ্নের বিষয়বস্তু বা টপিক দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
          />
        </div>

        <div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
          >
            <option value="all">সব বিষয় ({questions.length})</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
          >
            <option value="all">সব কাঠিন্যের মাত্রা</option>
            <option value="easy">সহজ (Easy)</option>
            <option value="medium">মাঝারি (Medium)</option>
            <option value="hard">কঠিন (Hard)</option>
          </select>
        </div>
      </div>

      {/* Selected Counter Notice */}
      <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">নির্বাচিত প্রশ্ন:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-num font-bold">
            {selectedQuestionIds.length}
          </span>
          {maxQuestions && (
            <span className="text-slate-500">
              / <strong className="font-num">{maxQuestions}</strong> টি প্রয়োজন
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500">
          মোট প্রশ্ন পাওয়া গেছে: <strong className="font-num">{filteredQuestions.length}</strong> টি
        </span>
      </div>

      {/* Questions List */}
      <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
        {filteredQuestions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            কোনো প্রশ্ন পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const qId = String(q._id || q.id);
            const isSelected = selectedQuestionIds.some((id) => String(id) === qId);

            return (
              <div
                key={qId}
                onClick={() => !q.isRunning && handleCardClick(q)}
                className={`p-3 rounded-xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                    : q.isRunning
                    ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                    : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50/50 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div
                      className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <FiCheck className="text-xs stroke-[3]" />
                    </div>

                    <div className="space-y-1 flex-1">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                          {q.subject}
                        </span>
                        {q.topic && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            {q.topic}
                          </span>
                        )}

                        {/* Usage status indicator */}
                        {q.isRunning ? (
                          <span className="px-2 py-0.5 rounded-md font-semibold bg-rose-100 text-rose-700">
                            চলমান পরীক্ষায় যুক্ত
                          </span>
                        ) : q.isUsed ? (
                          <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <FiAlertTriangle className="text-[10px]" /> পূর্বে ব্যবহৃত (
                            {q.usageCount} বার)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800">
                            অব্যবহৃত / নতুন
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                        {q.questionText || q.question}
                      </p>

                      {/* Options preview */}
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
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Warning Confirmation Modal for previously used questions */}
      {confirmModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-amber-200 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                <FiAlertTriangle className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  পূর্বে ব্যবহৃত প্রশ্ন সতর্কবার্তা
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  এই প্রশ্নটি পূর্বে একটি বা একাধিক পরীক্ষায় ব্যবহার হয়েছে{' '}
                  {confirmModalData.lastUsedExamTitle && (
                    <strong className="text-slate-800">
                      (যেমন: {confirmModalData.lastUsedExamTitle})
                    </strong>
                  )}
                  । আপনি কি এটি আবার বর্তমান পরীক্ষায় যুক্ত করতে চান?
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200">
              <strong>প্রশ্ন:</strong>{' '}
              {confirmModalData.questionText || confirmModalData.question}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmUsedSelection}
                className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shadow-xs cursor-pointer"
              >
                হ্যাঁ, যুক্ত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
