import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { 
  FiCalendar, 
  FiAward, 
  FiArrowRight, 
  FiSearch, 
  FiClock, 
  FiCheckCircle,
  FiBookOpen,
  FiLayers
} from 'react-icons/fi';

export default function AllExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams/public');
        if (res.data?.data) {
          setExams(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '11.09.2026';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateStr;
    }
  };

  const filteredExams = exams.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
    if (!matchSearch) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#1b44c8] via-[#1636a0] to-[#0f246e] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs font-semibold">
              <FiLayers />
              <span>সকল মডেল টেস্ট আর্কাইভ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              সকল প্রকাশিত মডেল টেস্টসমূহ
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              বিসিএস, প্রাইমারি, ব্যাংক ও অন্যান্য নিয়োগ পরীক্ষার জন্য যেকোনো টেস্ট বেছে নিয়ে অংশ নিন এবং তাৎক্ষণিক মেধা তালিকায় নিজের অবস্থান যাচাই করুন।
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="মডেল টেস্ট খুঁজুন (বিষয় বা নাম)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-slate-50/60"
            />
          </div>

          <div className="text-xs sm:text-sm text-slate-500 font-medium">
            মোট উপলভ্য পরীক্ষা: <strong className="text-blue-900 font-bold font-num">{filteredExams.length}টি</strong>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-16">
            <LoadingState message="সকল পরীক্ষা লোড হচ্ছে..." />
          </div>
        ) : filteredExams.length === 0 ? (
          <EmptyState
            title="কোনো মডেল টেস্ট পাওয়া যায়নি"
            description={search ? `"${search}" সম্পর্কিত কোনো পরীক্ষা পাওয়া যায়নি।` : 'বর্তমানে কোনো মডেল টেস্ট প্রকাশিত নেই।'}
            actionText={search ? "অনুসন্ধান রিসেট করুন" : undefined}
            onAction={search ? () => setSearch('') : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam, idx) => (
              <div
                key={exam._id || exam.slug || exam.id || `all_exam_${idx}`}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Card Header Top */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 font-num">
                      <FiCalendar className="text-slate-500" />
                      <span>{formatDate(exam.date)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      <span>সক্রিয়</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {exam.description || 'এই পরীক্ষার মাধ্যমে বিষয়ভিত্তিক জ্ঞান ও প্রস্তুতি যাচাই করুন।'}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="bg-slate-50/90 rounded-2xl p-3 grid grid-cols-3 gap-1.5 text-center border border-slate-100 font-num">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-sans">প্রশ্ন সংখ্যা</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {exam.questions?.length || exam.totalMarks || 10}টি
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-sans">সময়সীমা</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {exam.duration} মি.
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-sans">মোট নম্বর</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {exam.totalMarks || 10}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-100">
                  {exam.leaderboardEnabled ? (
                    <Link
                      to={`/exam/${exam.slug}/leaderboard`}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-1.5 transition"
                    >
                      <FiAward className="text-amber-500 text-sm" />
                      <span>লিডারবোর্ড</span>
                    </Link>
                  ) : (
                    <div />
                  )}

                  <Link
                    to={`/exam/${exam.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white text-xs sm:text-sm font-bold shadow-xs transition"
                  >
                    <span>পরীক্ষা দিন</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
