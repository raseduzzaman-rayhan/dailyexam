import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import ExamFormModal from './ExamFormModal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { 
  FiPlus, 
  FiSearch, 
  FiCopy, 
  FiEdit2, 
  FiTrash2, 
  FiCopy as FiDuplicate, 
  FiExternalLink, 
  FiCalendar, 
  FiClock, 
  FiAward, 
  FiUsers,
  FiSend
} from 'react-icons/fi';

export default function ExamManagementPage() {
  const { addToast } = useToast();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishingId, setPublishingId] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExams = useCallback(async () => {
    try {
      const res = await api.get('/exams');
      if (res.data?.data) {
        setExams(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('পরীক্ষা তালিকা লোড করতে ব্যর্থ হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handlePublish = async (exam) => {
    if (!exam?._id) return;
    setPublishingId(exam._id);
    try {
      const res = await api.patch(`/exams/${exam._id}/publish`);
      if (res.data?.success) {
        const msg = res.data.message || 'পরীক্ষাটি সফলভাবে প্রকাশ করা হয়েছে।';
        addToast(msg, 'success');
        const updatedExamData = res.data.exam || res.data.data;
        // Immediate frontend state update without requiring full page reload
        setExams((prevExams) =>
          prevExams.map((item) =>
            String(item._id) === String(exam._id)
              ? { ...item, status: 'published', ...(updatedExamData || {}) }
              : item
          )
        );
      } else {
        addToast(res.data?.message || 'পরীক্ষা প্রকাশ করা সম্ভব হয়নি।', 'error');
      }
    } catch (err) {
      console.error('Publish error:', err);
      const serverMsg = err.response?.data?.message;
      const status = err.response?.status;
      const displayMsg =
        serverMsg ||
        (status === 403
          ? 'আপনার এই পরীক্ষা প্রকাশ করার অনুমতি নেই।'
          : status === 404
          ? 'পরীক্ষাটি পাওয়া যায়নি।'
          : 'সার্ভারের সাথে সংযোগ করা যাচ্ছে না।');
      addToast(displayMsg, 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/exam/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    addToast('পরীক্ষার লিংক ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
  };

  const handleDuplicate = async (examId) => {
    try {
      await api.post(`/exams/${examId}/duplicate`);
      addToast('পরীক্ষার অনুলিপি সফলভাবে তৈরি হয়েছে।', 'success');
      fetchExams();
    } catch (err) {
      addToast(err.response?.data?.message || 'অনুলিপি তৈরি ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/exams/${deleteConfirmId}`);
      addToast('পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে।', 'success');
      setDeleteConfirmId(null);
      fetchExams();
    } catch (err) {
      addToast(err.response?.data?.message || 'মুছে ফেলতে সমস্যা হয়েছে।', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                          e.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            পরীক্ষা ও শিডিউল ব্যবস্থাপনা
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            মডেল টেস্ট প্রকাশ করুন, লিংক কপি করুন এবং স্ট্যাটাস পরিবর্তন করুন
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExam(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
        >
          <FiPlus className="text-base" />
          <span>নতুন পরীক্ষা তৈরি করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="পরীক্ষার নাম বা স্লাগ দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">স্ট্যাটাস:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-blue-500"
          >
            <option value="all">সকল স্ট্যাটাস</option>
            <option value="published">লাইভ / প্রকাশিত (Published)</option>
            <option value="draft">খসড়া (Draft)</option>
            <option value="closed">বন্ধ (Closed)</option>
          </select>
        </div>
      </div>

      {/* Exams Table / Cards */}
      {loading ? (
        <LoadingState message="পরীক্ষা তালিকা লোড হচ্ছে..." />
      ) : filteredExams.length === 0 ? (
        <EmptyState
          title="কোনো পরীক্ষা পাওয়া যায়নি"
          description="নতুন পরীক্ষা তৈরি করতে উপরের বাটনে ক্লিক করুন।"
          actionText="নতুন পরীক্ষা তৈরি"
          onAction={() => {
            setEditingExam(null);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">পরীক্ষার নাম ও তারিখ</th>
                  <th className="py-3.5 px-4 sm:px-6">প্রশ্ন ও সময়</th>
                  <th className="py-3.5 px-4 sm:px-6">অংশগ্রহণ</th>
                  <th className="py-3.5 px-4 sm:px-6">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredExams.map((exam) => {
                  const isPublished = exam.status === 'published';
                  const isDraft = exam.status === 'draft';

                  return (
                    <tr key={exam._id} className="hover:bg-slate-50/60 transition">
                      
                      {/* Title & Date */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block leading-snug">
                            {exam.title}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-num">
                            <FiCalendar className="text-slate-400" />
                            <span>{exam.date}</span>
                            <span>•</span>
                            <span className="text-[11px] text-slate-400 font-mono font-normal">
                              /exam/{exam.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="py-4 px-4 sm:px-6 font-num text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">
                              {exam.questions?.length || exam.questionCount || 0}টি প্রশ্ন
                            </span>
                            {exam.selectionMode === 'auto' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                                🤖 অটো
                              </span>
                            )}
                            {exam.selectionMode === 'hybrid' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                ⚡ হাইব্রিড
                              </span>
                            )}
                            {exam.selectionMode === 'custom' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                                ✍️ কাস্টম
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 block font-sans">
                            {exam.duration} মিনিট • {exam.totalMarks} মার্কস
                            {Number(exam.negativeMarks) > 0 ? ` (-${exam.negativeMarks})` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Submissions */}
                      <td className="py-4 px-4 sm:px-6 font-num">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                          <FiUsers className="text-slate-500" />
                          <span>{exam.submissionCount || 0} জন</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-num ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDraft
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isPublished && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {isDraft && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                          <span>{isPublished ? 'প্রকাশিত (Live)' : isDraft ? 'খসড়া (Draft)' : 'সমাপ্ত (Closed)'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Publish Button for Draft Exams */}
                          {isDraft && (
                            <button
                              id={`publish-btn-${exam._id}`}
                              onClick={() => handlePublish(exam)}
                              disabled={publishingId === exam._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
                              title="পরীক্ষাটি প্রকাশ করুন"
                            >
                              {publishingId === exam._id ? (
                                <>
                                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  <span>প্রকাশ করা হচ্ছে...</span>
                                </>
                              ) : (
                                <>
                                  <FiSend className="text-xs" />
                                  <span>প্রকাশ করুন</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopyLink(exam.slug)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                            title="পরীক্ষার লিংক কপি করুন"
                          >
                            <FiCopy />
                          </button>

                          {/* Leaderboard Link */}
                          <Link
                            to={`/exam/${exam.slug}/leaderboard`}
                            target="_blank"
                            className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="লিডারবোর্ড দেখুন"
                          >
                            <FiAward />
                          </Link>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingExam(exam);
                              setIsFormOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="সম্পাদনা করুন"
                          >
                            <FiEdit2 />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(exam._id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition"
                            title="অনুলিপি তৈরি করুন"
                          >
                            <FiDuplicate />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(exam._id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="মুছে ফেলুন"
                          >
                            <FiTrash2 />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <ExamFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={fetchExams}
        editExam={editingExam}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="পরীক্ষা মুছে ফেলুন"
        message="আপনি কি নিশ্চিত যে এই পরীক্ষাটি মুছে ফেলতে চান? এটি মুছে ফেললে এর সাথে সম্পর্কিত ফলাফলসমূহ প্রভাবিত হতে পারে।"
        confirmText="হ্যাঁ, মুছে ফেলুন"
        confirmVariant="danger"
        loading={deleting}
      />

    </div>
  );
}
