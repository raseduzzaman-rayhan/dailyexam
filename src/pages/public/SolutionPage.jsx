import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiHelpCircle, 
  FiArrowLeft, 
  FiFilter, 
  FiAward, 
  FiInfo,
  FiBookOpen
} from 'react-icons/fi';

export default function SolutionPage() {
  const { id } = useParams();
  const [solutionData, setSolutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'wrong' | 'unanswered'

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const res = await api.get(`/submissions/${id}/solution`);
        if (res.data?.data) {
          setSolutionData(res.data.data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'সমাধান লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id]);

  if (loading) {
    return <LoadingState message="প্রশ্নের সমাধান ও ব্যাখ্যা প্রস্তুত করা হচ্ছে..." />;
  }

  if (!solutionData) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">সমাধান পাওয়া যায়নি</h3>
        <p className="text-sm text-slate-500">{errorMsg || 'এই পরীক্ষার সমাধান উপলব্ধ নেই।'}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-[#1c398e] text-white rounded-xl text-sm font-semibold hover:bg-[#152e75] transition"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  const submission = solutionData.submission || {};
  const exam = solutionData.exam || {};
  const questions = solutionData.questions || solutionData.solutions || [];

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'correct') return q.status === 'correct';
    if (filter === 'wrong') return q.status === 'wrong';
    if (filter === 'unanswered') return q.status === 'unanswered';
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/70">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <Link
              to={`/result/${submission.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 mb-2 transition"
            >
              <FiArrowLeft />
              <span>ফলাফলে ফিরে যান</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {submission.examTitle} — সম্পূর্ণ সমাধান
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              পরীক্ষার্থী: <strong>{submission.studentName}</strong> | প্রাপ্ত নম্বর: <strong>{submission.score} / {submission.totalMarks}</strong> ({submission.percentage}%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/result/${submission.id}`}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              ফলাফল কার্ড
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            সব প্রশ্ন ({questions.length})
          </button>
          
          <button
            onClick={() => setFilter('correct')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filter === 'correct'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <FiCheckCircle />
            <span>সঠিক ({submission.correctCount})</span>
          </button>

          <button
            onClick={() => setFilter('wrong')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filter === 'wrong'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <FiXCircle />
            <span>ভুল ({submission.wrongCount})</span>
          </button>

          <button
            onClick={() => setFilter('unanswered')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              filter === 'unanswered'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FiHelpCircle />
            <span>উত্তর দেওয়া হয়নি ({submission.unansweredCount})</span>
          </button>
        </div>

        {/* Questions Solution List */}
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isCorrect = q.status === 'correct';
              const isWrong = q.status === 'wrong';
              const isUnanswered = q.status === 'unanswered';

              return (
                <div
                  key={q.questionId || q._id || q.id || `sol_q_${idx}`}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border shadow-xs transition-all ${
                    isCorrect
                      ? 'border-emerald-200'
                      : isWrong
                      ? 'border-rose-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Status Header */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap font-num">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white">
                        প্রশ্ন {idx + 1}
                      </span>
                      {q.subject && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {q.subject}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <FiCheckCircle className="text-emerald-600" />
                          <span>সঠিক উত্তর (+১)</span>
                        </span>
                      )}
                      {isWrong && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <FiXCircle className="text-rose-600" />
                          <span>ভুল উত্তর (০)</span>
                        </span>
                      )}
                      {isUnanswered && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <FiHelpCircle />
                          <span>অনুত্তরিত</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text in Kalpurush */}
                  <div className="text-lg sm:text-xl font-normal text-slate-900 mb-4 leading-relaxed font-kalpurush tracking-wide">
                    {q.questionText}
                  </div>

                  {/* Options List in Kalpurush */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 font-kalpurush">
                    {(q.options || []).map((opt) => {
                      const isStudentSelected = q.selectedOption === opt.id;
                      const isTheCorrectOption = q.correctAnswer === opt.id;

                      let optStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                      let badge = null;

                      if (isTheCorrectOption) {
                        optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-200';
                        badge = (
                          <span className="ml-auto text-xs font-bold text-emerald-700 flex items-center gap-1 font-sans">
                            <FiCheckCircle /> সঠিক উত্তর
                          </span>
                        );
                      } else if (isStudentSelected && isWrong) {
                        optStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium';
                        badge = (
                          <span className="ml-auto text-xs font-bold text-rose-600 flex items-center gap-1 font-sans">
                            <FiXCircle /> আপনার উত্তর
                          </span>
                        );
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-base sm:text-lg transition-all ${optStyle}`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-num ${
                              isTheCorrectOption
                                ? 'bg-emerald-600 text-white'
                                : isStudentSelected && isWrong
                                ? 'bg-rose-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-600'
                            }`}
                          >
                            {opt.id}
                          </div>
                          <span className="flex-1 font-kalpurush">{opt.text}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation in Bengali */}
                  {q.explanation ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs text-emerald-800">
                        <FiBookOpen className="text-emerald-600" />
                        ব্যাখ্যা ও সমাধান:
                      </span>
                      <p className="leading-relaxed text-slate-700 pl-5 text-sm sm:text-base font-kalpurush">
                        {q.explanation}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic font-kalpurush">
                      এই প্রশ্নের জন্য অতিরিক্ত কোনো ব্যাখ্যা নেই।
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <div className="pt-4 text-center">
          <Link
            to={`/result/${submission.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition"
          >
            <FiArrowLeft />
            <span>ফলাফল পেজে ফিরে যান</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
