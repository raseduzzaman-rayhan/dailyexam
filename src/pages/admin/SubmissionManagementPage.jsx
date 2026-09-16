import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { 
  FiFileText, 
  FiDownload, 
  FiSearch, 
  FiExternalLink, 
  FiAlertTriangle, 
  FiCalendar 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function SubmissionManagementPage() {
  const { addToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, examRes] = await Promise.all([
          api.get('/submissions'),
          api.get('/exams'),
        ]);
        if (subRes.data?.data) {
          setSubmissions(subRes.data.data);
        }
        if (examRes.data?.data) {
          setExams(examRes.data.data);
        }
      } catch (err) {
        console.error(err);
        addToast('জমাকৃত ফলাফল লোড করতে ব্যর্থ হয়েছে।', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      addToast('এক্সপোর্ট করার জন্য কোনো তথ্য নেই।', 'warning');
      return;
    }

    const headers = [
      'শিক্ষার্থীর নাম',
      'WhatsApp নম্বর',
      'ঠিকানা',
      'পরীক্ষার নাম',
      'প্রাপ্ত নম্বর',
      'মোট নম্বর',
      'শতকরা হার (%)',
      'স্ট্যাটাস (পাস/ফেল)',
      'ট্যাব পরিবর্তন',
      'জমা দেওয়ার তারিখ ও সময়',
    ];

    const rows = filtered.map(sub => [
      `"${sub.studentName}"`,
      `"${sub.whatsappNumber}"`,
      `"${sub.address}"`,
      `"${sub.examId?.title || sub.examSlug}"`,
      sub.score,
      sub.totalMarks,
      sub.percentage,
      sub.passed ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ',
      sub.tabSwitchCount || 0,
      `"${new Date(sub.submittedAt).toLocaleString('bn-BD')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `daily_exam_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV ফাইল ডাউনলোড সফল হয়েছে!', 'success');
  };

  const filtered = submissions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          sub.whatsappNumber.includes(search) ||
                          (sub.address && sub.address.toLowerCase().includes(search.toLowerCase()));
    const matchesExam = selectedExamId === 'all' || 
                        String(sub.examId?._id || sub.examId) === String(selectedExamId);
    return matchesSearch && matchesExam;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            জমাকৃত ফলাফল ও মূল্যায়ন
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            শিক্ষার্থীদের পরীক্ষার খাতা, স্কোর ও বিস্তারিত উত্তরপত্র যাচাই করুন
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
        >
          <FiDownload className="text-base" />
          <span>CSV এক্সপোর্ট করুন</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="শিক্ষার্থী বা নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">পরীক্ষা:</span>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:ring-blue-500 max-w-xs truncate"
          >
            <option value="all">সকল পরীক্ষা ({submissions.length})</option>
            {exams.map(ex => (
              <option key={ex._id} value={ex._id}>{ex.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <LoadingState message="জমাকৃত ফলাফল প্রস্তুত হচ্ছে..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো ফলাফল পাওয়া যায়নি"
          description="এখনো কোনো শিক্ষার্থী এই পরীক্ষায় অংশ নেয়নি অথবা ফিল্টারের সাথে মিল মেলেনি।"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">শিক্ষার্থী ও ঠিকানা</th>
                  <th className="py-3.5 px-4 sm:px-6">পরীক্ষার নাম</th>
                  <th className="py-3.5 px-4 sm:px-6">প্রাপ্ত নম্বর</th>
                  <th className="py-3.5 px-4 sm:px-6">শতকরা হার</th>
                  <th className="py-3.5 px-4 sm:px-6">নিরাপত্তা (ট্যাব)</th>
                  <th className="py-3.5 px-4 sm:px-6">জমা দেওয়ার সময়</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">লিংক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/60 transition">
                    
                    {/* Student Info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          {sub.studentName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-num">
                          <FaWhatsapp className="text-emerald-600" />
                          <span>{sub.whatsappNumber}</span>
                          {sub.address && <span>• {sub.address}</span>}
                        </div>
                      </div>
                    </td>

                    {/* Exam Title */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-medium text-slate-800 text-xs line-clamp-1">
                        {sub.examId?.title || sub.examSlug}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 sm:px-6 font-num text-xs">
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {sub.score}
                      </span>
                      <span className="text-slate-400"> / {sub.totalMarks}</span>
                    </td>

                    {/* Percentage */}
                    <td className="py-4 px-4 sm:px-6 font-num text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold ${
                        sub.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {sub.percentage}% ({sub.passed ? 'পাস' : 'ফেল'})
                      </span>
                    </td>

                    {/* Security Tab switch warning */}
                    <td className="py-4 px-4 sm:px-6 font-num text-xs">
                      {(sub.tabSwitchCount || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                          <FiAlertTriangle />
                          <span>{sub.tabSwitchCount} বার</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">স্বাভাবিক</span>
                      )}
                    </td>

                    {/* Submitted At */}
                    <td className="py-4 px-4 sm:px-6 font-num text-xs text-slate-500">
                      {new Date(sub.submittedAt).toLocaleString('bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <a
                        href={`/solution/${sub._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <FiExternalLink />
                        <span>উত্তরপত্র</span>
                      </a>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
