import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client.js';
import QuestionFormModal from './QuestionFormModal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiCopy, 
  FiCheckCircle, 
  FiHelpCircle,
  FiBookOpen
} from 'react-icons/fi';

export default function QuestionBankPage() {
  const { addToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await api.get('/questions');
      if (res.data?.data) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('প্রশ্ন ব্যাংক লোড করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDuplicate = async (qId) => {
    try {
      await api.post(`/questions/${qId}/duplicate`);
      addToast('প্রশ্নের অনুলিপি তৈরি হয়েছে।', 'success');
      fetchQuestions();
    } catch (err) {
      addToast(err.response?.data?.message || 'অনুলিপি ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/questions/${deleteConfirmId}`);
      addToast('প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে।', 'success');
      setDeleteConfirmId(null);
      fetchQuestions();
    } catch (err) {
      addToast(err.response?.data?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const subjects = Array.from(new Set(questions.map(q => q.subject).filter(Boolean)));

  const filtered = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(search.toLowerCase()) ||
                          q.subject.toLowerCase().includes(search.toLowerCase()) ||
                          (q.category && q.category.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDiff;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            প্রশ্ন ব্যাংক রিপোজিটরি
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            বিষয়ভিত্তিক প্রশ্ন তৈরি করুন, সম্পাদনা করুন ও মডেল টেস্টে যুক্ত করুন
          </p>
        </div>

        <button
          onClick={() => {
            setEditingQuestion(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
        >
          <FiPlus className="text-base" />
          <span>নতুন প্রশ্ন যোগ করুন</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="প্রশ্ন অথবা টপিক দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-blue-500"
          >
            <option value="all">সকল বিষয় ({questions.length})</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-blue-500"
          >
            <option value="all">সকল কাঠিন্য স্তর</option>
            <option value="easy">সহজ (Easy)</option>
            <option value="medium">মাঝারি (Medium)</option>
            <option value="hard">কঠিন (Hard)</option>
          </select>
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <LoadingState message="প্রশ্ন ব্যাংক লোড হচ্ছে..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো প্রশ্ন পাওয়া যায়নি"
          description="অনুসন্ধানের সাথে মিল পাওয়া যায়নি অথবা এখনো কোনো প্রশ্ন যোগ করা হয়নি।"
          actionText="নতুন প্রশ্ন যোগ করুন"
          onAction={() => {
            setEditingQuestion(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-num">
            <span>প্রদর্শিত প্রশ্ন: <strong>{filtered.length}টি</strong></span>
          </div>

          {filtered.map((q, idx) => (
            <div
              key={q._id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-4"
            >
              {/* Question Meta Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white font-num">
                    #{idx + 1}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">
                    {q.subject}
                  </span>
                  {q.category && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {q.category}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    q.difficulty === 'hard' ? 'bg-rose-50 text-rose-700' :
                    q.difficulty === 'easy' ? 'bg-blue-50 text-blue-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {q.difficulty === 'hard' ? 'কঠিন' : q.difficulty === 'easy' ? 'সহজ' : 'মাঝারি'}
                  </span>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setIsFormOpen(true);
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="সম্পাদনা করুন"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDuplicate(q._id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                    title="অনুলিপি তৈরি করুন"
                  >
                    <FiCopy />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(q._id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="মুছে ফেলুন"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Question Text in Kalpurush */}
              <div className="text-lg font-normal text-slate-900 leading-relaxed font-kalpurush">
                {q.questionText}
              </div>

              {/* 4 Options Grid with Correct Answer Highlight in Kalpurush */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-kalpurush">
                {(q.options || []).map((opt) => {
                  const isCorrect = q.correctAnswer === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition ${
                        isCorrect
                          ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-num ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-600'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className="flex-1 font-kalpurush">{opt.text}</span>
                      {isCorrect && (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 font-sans">
                          <FiCheckCircle /> সঠিক
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation (if any) */}
              {q.explanation && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                  <FiBookOpen className="text-blue-600 text-sm shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-sans">ব্যাখ্যা: </strong>
                    <span className="text-sm font-kalpurush text-slate-700">{q.explanation}</span>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <QuestionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchQuestions}
        editQuestion={editingQuestion}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="প্রশ্ন মুছে ফেলুন"
        message="আপনি কি এই প্রশ্নটি প্রশ্ন ব্যাংক থেকে মুছে ফেলতে চান?"
        confirmText="হ্যাঁ, মুছুন"
        confirmVariant="danger"
        loading={deleting}
      />

    </div>
  );
}
