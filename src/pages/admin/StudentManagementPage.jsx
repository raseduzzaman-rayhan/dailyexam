import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import Modal from '../../components/common/Modal.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { 
  FiUsers, 
  FiSearch, 
  FiClock, 
  FiAward, 
  FiExternalLink, 
  FiMapPin 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function StudentManagementPage() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // History modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        if (res.data?.data) {
          setStudents(res.data.data);
        }
      } catch (err) {
        console.error(err);
        addToast('শিক্ষার্থী তালিকা লোড ব্যর্থ হয়েছে।', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [addToast]);

  const viewHistory = async (student) => {
    setSelectedStudent(student);
    setLoadingHistory(true);
    const identifier = student.whatsappNumber || student.whatsapp || student._id;
    try {
      const res = await api.get(`/students/${identifier}/history`);
      if (res.data?.data) {
        setStudentHistory(res.data.data);
      }
    } catch (err) {
      addToast('ইতিহাস লোড ব্যর্থ হয়েছে।', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.whatsappNumber || s.whatsapp || '').includes(search) ||
    (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            শিক্ষার্থী ডিরেক্টরি
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            মডেল টেস্টে অংশগ্রহণকারী শিক্ষার্থীদের তালিকা, গড় স্কোর ও পরীক্ষার ইতিহাস
          </p>
        </div>
        <div className="font-num text-xs bg-blue-50 text-blue-800 px-3.5 py-1.5 rounded-xl border border-blue-100 font-bold">
          মোট শিক্ষার্থী: {students.length} জন
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <FiSearch className="text-slate-400 text-sm ml-2" />
        <input
          type="text"
          placeholder="শিক্ষার্থীর নাম, WhatsApp নম্বর বা জেলা দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs sm:text-sm focus:outline-none bg-transparent"
        />
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingState message="শিক্ষার্থী তালিকা প্রস্তুত হচ্ছে..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো শিক্ষার্থী পাওয়া যায়নি"
          description="এখনো কোনো শিক্ষার্থী পরীক্ষায় অংশ নেয়নি অথবা অনুসন্ধানের সাথে কোনো নাম মেলেনি।"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">শিক্ষার্থীর নাম</th>
                  <th className="py-3.5 px-4 sm:px-6">WhatsApp নম্বর</th>
                  <th className="py-3.5 px-4 sm:px-6">জেলা / ঠিকানা</th>
                  <th className="py-3.5 px-4 sm:px-6">মোট পরীক্ষা</th>
                  <th className="py-3.5 px-4 sm:px-6">গড় নম্বর (%)</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((st) => (
                  <tr key={st._id || st.whatsappNumber || st.whatsapp} className="hover:bg-slate-50/60 transition">
                    
                    {/* Name */}
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                      {st.name}
                    </td>

                    {/* WhatsApp */}
                    <td className="py-4 px-4 sm:px-6 font-num text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <FaWhatsapp className="text-emerald-600 text-sm" />
                        <span>{st.whatsappNumber || st.whatsapp}</span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <FiMapPin className="text-slate-400" />
                        <span>{st.address || '—'}</span>
                      </div>
                    </td>

                    {/* Total Exams */}
                    <td className="py-4 px-4 sm:px-6 font-num text-xs">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                        {st.totalExams}টি
                      </span>
                    </td>

                    {/* Avg % */}
                    <td className="py-4 px-4 sm:px-6 font-num text-xs">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-100">
                        {st.avgPercentage}%
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => viewHistory(st)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FiClock />
                        <span>ইতিহাস দেখুন</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`${selectedStudent?.name}-এর পরীক্ষার ইতিহাস`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between font-num">
            <span>WhatsApp: <strong>{selectedStudent?.whatsappNumber}</strong></span>
            <span>ঠিকানা: <strong>{selectedStudent?.address}</strong></span>
          </div>

          {loadingHistory ? (
            <div className="p-8 text-center text-xs text-slate-500">ইতিহাস লোড হচ্ছে...</div>
          ) : studentHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">কোনো ইতিহাস পাওয়া যায়নি।</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {studentHistory.map((item) => (
                <div key={item.submissionId} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{item.examTitle}</h5>
                    <span className="text-slate-400 font-num">
                      তারিখ: {new Date(item.submittedAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-num">
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {item.score} / {item.totalQuestions} ({item.percentage}%)
                    </span>
                    <a
                      href={`/solution/${item.submissionId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1"
                    >
                      <FiExternalLink />
                      <span>সমাধান</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
