import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { 
  FiSearch, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAward, 
  FiArrowRight, 
  FiCalendar,
  FiBookOpen,
  FiUserCheck,
  FiLogIn,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function StudentHistoryPage() {
  const { student, isStudent } = useAuth();
  const [whatsapp, setWhatsapp] = useState('');
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-load for authenticated student
  useEffect(() => {
    if (student) {
      setLoading(true);
      setSearched(true);
      api.get('/submissions/my/history')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data)) {
            setHistory(res.data.data);
          }
        })
        .catch((err) => {
          console.warn('[History fetch notice]:', err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [student]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanNum = whatsapp.replace(/\D/g, '');
    if (!cleanNum || cleanNum.length < 10) {
      setErrorMsg('অনুগ্রহ করে সঠিক WhatsApp নম্বর লিখুন (যেমন: 01711223344)।');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setSearched(true);

    try {
      const res = await api.get(`/students/${cleanNum}/history`);
      if (res.data?.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'ইতিহাস অনুসন্ধানে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FiClock className="text-2xl text-[#1c398e]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              পরীক্ষার ফলাফল ও ইতিহাস
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
              পূর্বে অংশগ্রহণ করা সকল মডেল টেস্টের ফলাফল, অর্জিত নম্বর এবং বিস্তারিত সমাধান পর্যালোচনা করুন।
            </p>
          </div>

          {isStudent ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1c398e] text-xs font-bold">
              <FiUserCheck className="text-sm" />
              <span>যাচাইকৃত শিক্ষার্থী অ্যাকাউন্ট: {student.name}</span>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <FiLogIn />
                  <span>লগইন করে নিজের সম্পূর্ণ ইতিহাস দেখুন</span>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] text-slate-400 font-medium">অথবা WhatsApp নম্বর দিয়ে খুঁজুন</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Search Box Form */}
              <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
                <div className="relative flex-1">
                  <FaWhatsapp className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-lg" />
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50 font-num"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white text-sm font-bold shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <FiSearch />
                  <span>খুঁজুন</span>
                </button>
              </form>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
              )}
            </div>
          )}
        </div>

        {/* Results Area */}
        {loading && <LoadingState message="আপনার পরীক্ষার ইতিহাস খোঁজা হচ্ছে..." />}

        {!loading && searched && history && (
          <div>
            {history.length === 0 ? (
              <EmptyState
                title="কোনো পরীক্ষার রেকর্ড পাওয়া যায়নি"
                description={
                  isStudent
                    ? 'আপনি এখনো কোনো মডেল টেস্ট জমা দেননি। আজকের পরীক্ষায় অংশ নিয়ে প্রস্তুতি যাচাই করুন!'
                    : `নম্বর ${whatsapp} দিয়ে এখনো কোনো মডেল টেস্ট জমা দেওয়া হয়নি।`
                }
                actionText="আজকের পরীক্ষায় অংশ নিন"
                actionTo="/"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-bold text-slate-700">
                    মোট পাওয়া গেছে: <span className="text-blue-600 font-num">{history.length}</span> টি পরীক্ষা
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {history.map((sub, index) => {
                    const isPassed = sub.passed;
                    const dateStr = sub.examDate || sub.submittedAt;
                    const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('bn-BD') : '';

                    return (
                      <div
                        key={sub.submissionId || index}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-num">
                              <FiCalendar className="text-[11px]" />
                              {formattedDate}
                            </span>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                                isPassed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}
                            >
                              {isPassed ? <FiCheckCircle /> : <FiXCircle />}
                              <span>{isPassed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'}</span>
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">
                            {sub.examTitle}
                          </h3>

                          <div className="flex items-center gap-4 text-xs text-slate-500 font-num flex-wrap">
                            <span>মোট প্রশ্ন: <strong>{sub.totalQuestions}</strong></span>
                            {sub.correctCount !== undefined && (
                              <span className="text-emerald-600 font-semibold">সঠিক: {sub.correctCount}</span>
                            )}
                            {sub.wrongCount !== undefined && (
                              <span className="text-rose-600 font-semibold">ভুল: {sub.wrongCount}</span>
                            )}
                            {sub.durationSeconds > 0 && (
                              <span>সময়: {Math.floor(sub.durationSeconds / 60)} মি. {sub.durationSeconds % 60} সে.</span>
                            )}
                          </div>
                        </div>

                        {/* Right: Score & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <div className="text-2xl font-black text-slate-900 font-num">
                              {sub.score} <span className="text-xs font-semibold text-slate-400">নম্বর</span>
                            </div>
                            <div className="text-xs font-bold text-blue-600 font-num">
                              {sub.percentage}% নম্বর
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              to={`/result/${sub.submissionId}`}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                            >
                              <span>রেজাল্ট</span>
                            </Link>

                            <Link
                              to={`/solution/${sub.submissionId}`}
                              className="px-4 py-2 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                            >
                              <FiBookOpen />
                              <span>সমাধান</span>
                              <FiArrowRight />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
