import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { 
  FiBarChart2, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiSearch, 
  FiFilter 
} from 'react-icons/fi';

export default function AnalyticsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'hard'

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/questions');
        if (res.data?.data) {
          setQuestions(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingState message="প্রশ্নভিত্তিক পারফরম্যান্স রিপোর্ট প্রস্তুত হচ্ছে..." />;
  }

  const hardCount = questions.filter(q => q.isHard).length;

  const filtered = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(search.toLowerCase()) ||
                          q.subject.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || (filterType === 'hard' && q.isHard);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            প্রশ্ন পারফরম্যান্স ও বিশ্লেষণ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            কোন প্রশ্নগুলোতে শিক্ষার্থীরা বেশি ভুল করছে তা স্বয়ংক্রিয়ভাবে শনাক্ত করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold font-num flex items-center gap-1.5">
            <FiAlertTriangle className="text-rose-600" />
            <span>চিহ্নিত কঠিন প্রশ্ন: {hardCount}টি</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="প্রশ্ন বা বিষয় দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            সকল প্রশ্ন ({questions.length})
          </button>
          <button
            onClick={() => setFilterType('hard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'hard'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            কঠিন প্রশ্নসমূহ ({hardCount})
          </button>
        </div>
      </div>

      {/* Questions Performance Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="কোনো তথ্য পাওয়া যায়নি"
          description="বর্তমান ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">প্রশ্ন ও বিষয়</th>
                  <th className="py-3.5 px-4 sm:px-6">মোট উত্তর প্রদান</th>
                  <th className="py-3.5 px-4 sm:px-6">সঠিক উত্তর</th>
                  <th className="py-3.5 px-4 sm:px-6">ভুল উত্তর</th>
                  <th className="py-3.5 px-4 sm:px-6">সাফল্যের হার (Success Rate)</th>
                  <th className="py-3.5 px-4 sm:px-6">মূল্যায়ন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((item) => {
                  const isHard = item.isHard;
                  const rate = item.successRate;

                  return (
                    <tr key={item.questionId} className="hover:bg-slate-50/60 transition">
                      
                      {/* Question Text */}
                      <td className="py-4 px-4 sm:px-6 max-w-md">
                        <div className="space-y-1">
                          <span className="font-normal text-slate-900 block text-sm line-clamp-2 font-kalpurush">
                            {item.questionText}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {item.subject}
                          </span>
                        </div>
                      </td>

                      {/* Total Attempts */}
                      <td className="py-4 px-4 sm:px-6 font-num text-xs">
                        <span className="font-bold text-slate-800">
                          {item.attempts} বার
                        </span>
                      </td>

                      {/* Correct */}
                      <td className="py-4 px-4 sm:px-6 font-num text-xs">
                        <span className="font-bold text-emerald-700">
                          {item.correct}টি
                        </span>
                      </td>

                      {/* Wrong */}
                      <td className="py-4 px-4 sm:px-6 font-num text-xs">
                        <span className="font-bold text-rose-700">
                          {item.wrong}টি
                        </span>
                      </td>

                      {/* Success Rate Bar */}
                      <td className="py-4 px-4 sm:px-6 font-num text-xs">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between font-bold text-[11px]">
                            <span className={rate < 50 ? 'text-rose-600' : 'text-emerald-700'}>
                              {rate}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                rate < 50 ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Verdict */}
                      <td className="py-4 px-4 sm:px-6">
                        {isHard ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <FiAlertTriangle />
                            <span>কঠিন প্রশ্ন (&lt;৫০%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FiCheckCircle />
                            <span>সন্তোষজনক</span>
                          </span>
                        )}
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
  );
}
