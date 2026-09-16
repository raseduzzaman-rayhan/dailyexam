import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import confetti from 'canvas-confetti';
import LoadingState from '../../components/common/LoadingState.jsx';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle, 
  FiHelpCircle, 
  FiAward, 
  FiBookOpen, 
  FiClock, 
  FiUser, 
  FiMapPin, 
  FiShare2, 
  FiHome 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/submissions/${id}`);
        if (res.data?.data) {
          setResult(res.data.data);

          // Trigger confetti if percentage >= 60%
          if (res.data.data.percentage >= 60) {
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch (e) {
              // Ignore confetti error if any
            }
          }
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'ফলাফল পাওয়া যায়নি।');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return <LoadingState message="আপনার পরীক্ষার ফলাফল প্রস্তুত হচ্ছে..." />;
  }

  if (!result) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <FiAlertCircle className="text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">ফলাফল পাওয়া যায়নি</h3>
        <p className="text-sm text-slate-500">{errorMsg || 'এই সাবমিশনের ফলাফল উপলব্ধ নেই।'}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-[#1c398e] text-white rounded-xl text-sm font-semibold hover:bg-[#152e75] transition"
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  // Performance message
  const pct = result.percentage;
  let statusText = 'আরও অনুশীলন করুন 📚';
  let statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
  if (pct >= 90) {
    statusText = 'অসাধারণ! 🎉';
    statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (pct >= 80) {
    statusText = 'খুব ভালো! 👏';
    statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (pct >= 70) {
    statusText = 'ভালো! 👍';
    statusColor = 'text-blue-700 bg-blue-50 border-blue-200';
  }

  // Share text for WhatsApp
  const shareText = `আমি "${result.examTitle}" মডেল টেস্টে ${result.score}/${result.totalMarks} পেয়েছি! আমার প্রাপ্ত নম্বর ${result.percentage}%। আপনিও পরীক্ষা দিন: ${window.location.origin}/exam/${result.examSlug}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const minutesTaken = Math.floor((result.durationSeconds || 0) / 60);
  const secondsTaken = (result.durationSeconds || 0) % 60;
  const timeTakenFormatted = `${minutesTaken} মি. ${secondsTaken} সে.`;

  return (
    <div className="min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Celebration Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-blue-100 text-blue-800">
            <FiCheckCircle className="text-blue-600 text-base" />
            <span>পরীক্ষা সম্পন্ন হয়েছে 🎉</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {result.examTitle}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-num">
            <span>তারিখ: {new Date(result.submittedAt).toLocaleDateString('bn-BD')}</span>
            <span>•</span>
            <span>সময় লেগেছে: {timeTakenFormatted}</span>
          </div>
        </div>

        {/* Big Score Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-6">
          
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              প্রাপ্ত মোট নম্বর
            </span>
            <div className="flex items-baseline justify-center gap-2 font-num">
              <span className="text-5xl sm:text-6xl font-black text-slate-900">
                {result.score}
              </span>
              <span className="text-2xl font-bold text-slate-400">
                / {result.totalMarks}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold border ${statusColor}`}>
                {statusText} ({result.percentage}%)
              </span>
            </div>
          </div>

          {/* Detailed Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-num pt-4 border-t border-slate-100">
            
            {/* Correct */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <div className="flex items-center justify-center text-emerald-600 mb-1">
                <FiCheckCircle className="text-xl" />
              </div>
              <span className="text-xs text-slate-600 block font-sans">সঠিক উত্তর</span>
              <span className="text-xl font-extrabold text-emerald-700">
                {result.correctCount}টি
              </span>
            </div>

            {/* Wrong */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
              <div className="flex items-center justify-center text-rose-600 mb-1">
                <FiXCircle className="text-xl" />
              </div>
              <span className="text-xs text-slate-600 block font-sans">ভুল উত্তর</span>
              <span className="text-xl font-extrabold text-rose-700">
                {result.wrongCount}টি
              </span>
            </div>

            {/* Unanswered */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center text-slate-400 mb-1">
                <FiHelpCircle className="text-xl" />
              </div>
              <span className="text-xs text-slate-600 block font-sans">অনুত্তরিত</span>
              <span className="text-xl font-extrabold text-slate-700">
                {result.unansweredCount}টি
              </span>
            </div>

            {/* Total */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center text-slate-600 mb-1">
                <FiAward className="text-xl" />
              </div>
              <span className="text-xs text-slate-600 block font-sans">মোট প্রশ্ন</span>
              <span className="text-xl font-extrabold text-slate-900">
                {result.totalQuestions}টি
              </span>
            </div>

          </div>

          {/* Student Profile Info */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-1.5">
              <FiUser className="text-slate-400" />
              <span>শিক্ষার্থী: <strong className="text-slate-900">{result.studentName}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-num">
              <FaWhatsapp className="text-emerald-600" />
              <span>WhatsApp: <strong className="text-slate-900">{result.whatsappNumber}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiMapPin className="text-slate-400" />
              <span>ঠিকানা: <strong className="text-slate-900">{result.address}</strong></span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          
          {/* Solution Page Button */}
          <Link
            to={`/solution/${result._id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-sm shadow-md transition"
          >
            <FiBookOpen className="text-lg" />
            <span>📖 বিস্তারিত সমাধান দেখুন</span>
          </Link>

          {/* WhatsApp Share Button */}
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
          >
            <FaWhatsapp className="text-lg" />
            <span>📲 WhatsApp-এ Result Share করুন</span>
          </a>

          {/* Leaderboard Button */}
          {result.leaderboardEnabled && (
            <Link
              to={`/exam/${result.examSlug}/leaderboard`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm shadow-xs transition"
            >
              <FiAward className="text-lg text-amber-500" />
              <span>🏆 Leaderboard দেখুন</span>
            </Link>
          )}

        </div>

        {/* Back to Home Link */}
        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700 transition"
          >
            <FiHome />
            <span>হোমে ফিরে যান</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
