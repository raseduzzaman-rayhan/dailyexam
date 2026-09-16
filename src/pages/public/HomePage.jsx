import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { 
  FiCalendar, 
  FiCheckCircle, 
  FiAward, 
  FiBookOpen, 
  FiArrowRight 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function HomePage() {
  const { settings } = useSettings();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch published exams from backend API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams/public');
        if (res.data?.data) {
          setExams(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load published exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Format date to DD.MM.YYYY matching reference image (e.g. 09.09.2026)
  const formatDate = (dateStr) => {
    if (!dateStr) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return `${day}.${month}.${year}`;
    }
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

  // Primary active exam for today
  const todayExam = exams.length > 0 ? exams[0] : null;

  const whatsappNumber = (settings?.whatsappNumber || '8801712345678').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO SECTION (Matching Reference Image) */}
      <section className="bg-gradient-to-b from-[#1b44c8] via-[#1636a0] to-[#0f246e] text-white pt-16 pb-20 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-5 relative z-10">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs sm:text-sm font-medium backdrop-blur-xs">
            <span>প্রতিদিন অনলাইন মডেল টেস্ট</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            নিয়মিত পরীক্ষা দিন, নিজের মেধা ও প্রস্তুতি যাচাই করুন
          </h1>

          {/* Subtitle */}
          <p className="text-blue-100/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            ১১-১৬ গ্রেড সরকারি চাকরির পরীক্ষার জন্য নির্ভুল প্রশ্নব্যাংক, স্বয়ংক্রিয় মূল্যায়ন এবং তাৎক্ষণিক সমাধান।
          </p>

          {/* Feature Highlights Row */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 pt-6 text-xs sm:text-sm text-blue-100/90 font-medium">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-blue-300 text-base shrink-0" />
              <span>তাৎক্ষণিক ফলাফল ও বিস্তারিত ব্যাখ্যা</span>
            </div>
            <div className="flex items-center gap-2">
              <FiAward className="text-blue-300 text-base shrink-0" />
              <span>মেধা তালিকা (লিডারবোর্ড)</span>
            </div>
            <div className="flex items-center gap-2">
              <FiBookOpen className="text-blue-300 text-base shrink-0" />
              <span>কোনো রেজিস্ট্রেশন ছাড়াই পরীক্ষা</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. TODAY'S EXAM SECTION (Matching Reference Image) */}
      <section id="today-exam" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Heading with vertical blue bar */}
          <div className="flex items-center justify-center mb-8">
            <span className="w-1.5 h-7 bg-[#1c398e] rounded-full mr-2.5 inline-block" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              আজকের মডেল টেস্ট
            </h2>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="max-w-xl mx-auto py-12">
              <LoadingState message="আজকের মডেল টেস্ট লোড হচ্ছে..." />
            </div>
          ) : !todayExam ? (
            <div className="max-w-xl mx-auto">
              <EmptyState
                title="বর্তমানে কোনো পরীক্ষা চালু নেই"
                description="অ্যাডমিন প্যানেল থেকে নতুন পরীক্ষা প্রকাশ করা হলে তা এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।"
              />
            </div>
          ) : (
            /* Centered Exam Card (Exact reproduction of reference image) */
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow">
              
              {/* Card Header Top: Date & Live Status */}
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 font-num">
                  <FiCalendar className="text-slate-500 text-sm" />
                  <span>{formatDate(todayExam.date)}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                  <span>লাইভ এক্সাম</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
              </div>

              {/* Card Title & Description */}
              <div className="mt-5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {todayExam.title || 'আজকের মডেল টেস্ট'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  {todayExam.description || 'এই পরীক্ষার মাধ্যমে বিষয়ভিত্তিক জ্ঞান ও প্রস্তুতি যাচাই করুন।'}
                </p>
              </div>

              {/* 3-Column Stats Box */}
              <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-4 my-6 grid grid-cols-3 gap-2 text-center border border-slate-100/90 font-num">
                <div className="space-y-0.5">
                  <span className="text-[11px] sm:text-xs text-slate-500 block font-sans">প্রশ্ন সংখ্যা</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 block">
                    {todayExam.questions?.length || todayExam.totalMarks || 10}টি
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] sm:text-xs text-slate-500 block font-sans">সময়সীমা</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 block">
                    {todayExam.duration || 20} মি.
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] sm:text-xs text-slate-500 block font-sans">মোট নম্বর</span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 block">
                    {todayExam.totalMarks || 10}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {todayExam.leaderboardEnabled ? (
                  <Link
                    to={`/exam/${todayExam.slug}/leaderboard`}
                    className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-1.5 transition"
                  >
                    <FiAward className="text-amber-500 text-base" />
                    <span>লিডারবোর্ড</span>
                  </Link>
                ) : (
                  <div />
                )}

                <Link
                  to={`/exam/${todayExam.slug}`}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  <span>পরীক্ষা শুরু করুন</span>
                  <FiArrowRight className="text-base" />
                </Link>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 3. WHATSAPP CTA BANNER (Matching Reference Image) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
        <div className="bg-[#10245a] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          
          {/* Left Text */}
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              দৈনিক পরীক্ষার লিংক সবার আগে পেতে চান?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/85 max-w-xl leading-relaxed">
              আমাদের অফিসিয়াল WhatsApp স্টাডি গ্রুপে যোগ দিন এবং প্রতিদিন নতুন মডেল টেস্ট ও পিডিএফ সমাধান নোটিফিকেশন পান।
            </p>
          </div>

          {/* Right Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 text-sm sm:text-base font-bold shadow-lg transition shrink-0"
          >
            <FaWhatsapp className="text-2xl text-emerald-500" />
            <span>WhatsApp গ্রুপে যোগ দিন</span>
          </a>

        </div>
      </section>

    </div>
  );
}
