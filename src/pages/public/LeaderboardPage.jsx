import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { 
  FiAward, 
  FiSearch, 
  FiClock, 
  FiUser, 
  FiArrowLeft, 
  FiArrowRight, 
  FiCalendar 
} from 'react-icons/fi';

export default function LeaderboardPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get(`/exams/${slug}/leaderboard`);
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'লিডারবোর্ড লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [slug]);

  if (loading) {
    return <LoadingState message="মেধা তালিকা (Leaderboard) প্রস্তুত হচ্ছে..." />;
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">লিডারবোর্ড পাওয়া যায়নি</h3>
        <p className="text-sm text-slate-500">{errorMsg || 'এই পরীক্ষার জন্য লিডারবোর্ড চালু নেই।'}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-[#1c398e] text-white rounded-xl text-sm font-semibold hover:bg-[#152e75] transition"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  const { examTitle, date, leaderboard = [] } = data;

  const filtered = leaderboard.filter(item =>
    item.studentName.toLowerCase().includes(search.toLowerCase()) ||
    item.maskedWhatsApp.includes(search)
  );

  return (
    <div className="min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/70">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              to={`/exam/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 mb-2 transition"
            >
              <FiArrowLeft />
              <span>পরীক্ষার বিস্তারিত দেখুন</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600 text-xl">
                <FiAward />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {examTitle} — মেধা তালিকা
                </h1>
                <p className="text-xs text-slate-500 font-num">
                  তারিখ: {date} • মোট অংশ নিয়েছেন: {leaderboard.length} জন শিক্ষার্থী
                </p>
              </div>
            </div>
          </div>

          <Link
            to={`/exam/${slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-xs sm:text-sm shadow-xs transition"
          >
            <span>পরীক্ষায় অংশ নিন</span>
            <FiArrowRight />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <FiSearch className="text-slate-400 text-lg ml-1" />
          <input
            type="text"
            placeholder="শিক্ষার্থীর নাম বা নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm focus:outline-none bg-transparent"
          />
        </div>

        {/* Leaderboard Table / Cards */}
        {filtered.length === 0 ? (
          <EmptyState
            title="কোনো রেকর্ড পাওয়া যায়নি"
            description="এখনো কেউ এই পরীক্ষায় অংশগ্রহণ করেনি অথবা অনুসন্ধানের সাথে কোনো নাম মেলেনি।"
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">র‌্যাংক</th>
                    <th className="py-3.5 px-4 sm:px-6">শিক্ষার্থী</th>
                    <th className="py-3.5 px-4 sm:px-6">নম্বর</th>
                    <th className="py-3.5 px-4 sm:px-6">শতকরা হার</th>
                    <th className="py-3.5 px-4 sm:px-6">সময় ব্যয়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((entry, idx) => {
                    const isFirst = entry.rank === 1;
                    const isSecond = entry.rank === 2;
                    const isThird = entry.rank === 3;

                    const minutes = Math.floor((entry.durationSeconds || 0) / 60);
                    const seconds = (entry.durationSeconds || 0) % 60;
                    const timeFormatted = `${minutes}মি. ${seconds}সে.`;

                    return (
                      <tr
                        key={entry.submissionId || entry._id || entry.id || `rank_${entry.rank || idx}`}
                        className={`transition-colors ${
                          isFirst
                            ? 'bg-amber-50/40 font-semibold'
                            : isSecond
                            ? 'bg-slate-50/60'
                            : isThird
                            ? 'bg-amber-50/20'
                            : 'hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-2 font-num font-extrabold text-sm">
                            {isFirst && <span className="text-xl">🥇</span>}
                            {isSecond && <span className="text-xl">🥈</span>}
                            {isThird && <span className="text-xl">🥉</span>}
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                                isFirst
                                  ? 'bg-amber-400 text-slate-900'
                                  : isSecond
                                  ? 'bg-slate-200 text-slate-800'
                                  : isThird
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {entry.rank}
                            </span>
                          </div>
                        </td>

                        {/* Student Name & Masked Phone */}
                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {entry.studentName}
                            </span>
                            <span className="text-xs text-slate-400 font-num">
                              {entry.maskedWhatsApp}
                            </span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-4 sm:px-6 font-num">
                          <span className="font-extrabold text-blue-700 text-base">
                            {entry.score}
                          </span>
                          <span className="text-xs text-slate-400"> / {entry.totalMarks}</span>
                        </td>

                        {/* Percentage */}
                        <td className="py-4 px-4 sm:px-6 font-num">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {entry.percentage}%
                          </span>
                        </td>

                        {/* Time */}
                        <td className="py-4 px-4 sm:px-6 font-num text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <FiClock className="text-slate-400" />
                            <span>{timeFormatted}</span>
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

      </div>
    </div>
  );
}
