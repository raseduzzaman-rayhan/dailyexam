import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import { 
  FiLayers, 
  FiUsers, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiHelpCircle, 
  FiAward, 
  FiPlus, 
  FiArrowRight, 
  FiFileText,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('ড্যাশবোর্ডের তথ্য লোড করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingState message="ড্যাশবোর্ড অ্যানালিটিক্স লোড হচ্ছে..." />;
  }

  if (error && !data) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xs text-center max-w-lg mx-auto my-12">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="text-2xl" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-2">
          {error}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি বা অনুমতি নেই।
        </p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
        >
          <FiRefreshCw className="text-sm" />
          <span>পুনরায় চেষ্টা করুন</span>
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  const kpis = [
    {
      title: 'আজকের পরীক্ষা',
      value: `${summary.todayExamsCount || 0}টি`,
      desc: 'চলমান সক্রিয় মডেল টেস্ট',
      icon: FiLayers,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'মোট শিক্ষার্থী',
      value: `${summary.totalStudentsCount || 0} জন`,
      desc: 'অনন্য WhatsApp ভিত্তিক শিক্ষার্থী',
      icon: FiUsers,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'আজকের অংশগ্রহণ',
      value: `${summary.todayParticipantsCount || 0} জন`,
      desc: 'আজ জমা হওয়া সাবমিশন',
      icon: FiCheckCircle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'গড় স্কোর (Avg Score)',
      value: `${summary.averageScore || 0}`,
      desc: `উত্তীর্ণের হার: ${summary.passRate || 0}%`,
      icon: FiTrendingUp,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      title: 'সর্বোচ্চ স্কোর',
      value: `${summary.highestScore || 0}`,
      desc: 'রেকর্ডকৃত সর্বোচ্চ নম্বর',
      icon: FiAward,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      title: 'প্রশ্ন ব্যাংক স্টক',
      value: `${summary.totalQuestionsBank || 0}টি`,
      desc: 'প্রস্তুতকৃত প্রশ্নের সংখ্যা',
      icon: FiHelpCircle,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            অ্যাডমিন ড্যাশবোর্ড ওভারভিউ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            মডেল টেস্ট প্ল্যাটফর্মের রিয়েল-টাইম পারফরম্যান্স ও অগ্রগতি রিপোর্ট
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-xs sm:text-sm shadow-xs transition"
          >
            <FiPlus />
            <span>নতুন পরীক্ষা তৈরি</span>
          </Link>
          <Link
            to="/admin/questions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition"
          >
            <FiHelpCircle />
            <span>প্রশ্ন যোগ করুন</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-num">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-600 font-sans line-clamp-1">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="text-base" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black text-slate-900 block">
                  {kpi.value}
                </span>
                <span className="text-[11px] text-slate-400 font-sans mt-0.5 block line-clamp-1">
                  {kpi.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Participation Chart (Last 7 Days) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                গত ৭ দিনের শিক্ষার্থী অংশগ্রহণ প্রবণতা
              </h2>
              <p className="text-xs text-slate-500">প্রতিদিনের পরীক্ষার্থী সাবমিশন সংখ্যা</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              সক্রিয় চার্ট
            </span>
          </div>

          <div className="h-64 w-full font-num text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.dailyParticipation || []}>
                <defs>
                  <linearGradient id="colorPart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c398e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1c398e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" />
                <YAxis stroke="#64748B" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    border: 'none',
                  }}
                  formatter={(val) => [`${val} জন পরীক্ষার্থী`, 'অংশগ্রহণ']}
                />
                <Area
                  type="monotone"
                  dataKey="participants"
                  stroke="#1c398e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPart)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Answer Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              সামগ্রিক উত্তর বিশ্লেষণ
            </h2>
            <p className="text-xs text-slate-500 mb-4">সকল সাবমিশনের সঠিক, ভুল ও অনুত্তরিত অনুপাত</p>
          </div>

          <div className="h-52 w-full font-num">
            {(charts.scoreDistribution || []).some((item) => (item.value || 0) > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.scoreDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(charts.scoreDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
                <FiHelpCircle className="text-3xl text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-medium">এখনও কোনো উত্তর সাবমিশন বিশ্লেষণ নেই</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {(charts.scoreDistribution || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 font-num">{item.value}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/exams"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition group flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition">
              পরীক্ষা তালিকা ও শিডিউল
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">সবগুলো মডেল টেস্ট পরিচালনা ও লিংক কপি করুন</p>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-blue-600 text-lg transition" />
        </Link>

        <Link
          to="/admin/submissions"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition group flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition">
              জমাকৃত রেজাল্ট ও এক্সপোর্ট
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">শিক্ষার্থীদের খাতা মূল্যায়ন ও CSV ডাউনলোড</p>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-blue-600 text-lg transition" />
        </Link>

        <Link
          to="/admin/analytics"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition group flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition">
              প্রশ্নভিত্তিক বিস্তারিত রিপোর্ট
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">কঠিন প্রশ্ন ও শিক্ষার্থীদের সাফল্যের হার</p>
          </div>
          <FiArrowRight className="text-slate-400 group-hover:text-blue-600 text-lg transition" />
        </Link>
      </div>

    </div>
  );
}
