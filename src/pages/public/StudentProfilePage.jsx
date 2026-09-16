import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import api from '../../api/client.js';
import locationData from '../../data/locationData.json';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiAward,
  FiClock,
  FiBarChart2,
  FiEdit2,
  FiSave,
  FiLogOut,
  FiCheckCircle,
} from 'react-icons/fi';

const EDUCATION_LEVELS = [
  'এইচএসসি / আলিম',
  'ডিগ্রি / অনার্স',
  'মাস্টার্স',
  'বিসিএস / সরকারি চাকরি প্রত্যাশী',
  'প্রাথমিক সহকারী শিক্ষক প্রত্যাশী',
  'অন্যান্য',
];

export default function StudentProfilePage() {
  const { student, studentLogout, updateStudentProfile } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyStats, setHistoryStats] = useState({
    totalExams: 0,
    passedCount: 0,
    avgScore: 0,
    highestScore: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    division: '',
    district: '',
    upazila: '',
    educationLevel: '',
    institution: '',
    subject: '',
    passingYear: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        whatsapp: student.whatsapp || '',
        division: student.location?.division || '',
        district: student.location?.district || '',
        upazila: student.location?.upazila || '',
        educationLevel: student.education?.level || 'ডিগ্রি / অনার্স',
        institution: student.education?.institution || '',
        subject: student.education?.subject || '',
        passingYear: student.education?.passingYear || '',
      });

      // Fetch student's own history stats
      api.get('/submissions/my/history')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data)) {
            const list = res.data.data;
            const total = list.length;
            const passed = list.filter((s) => s.passed).length;
            const highest = total > 0 ? Math.max(...list.map((s) => s.score || 0)) : 0;
            const sumScore = list.reduce((a, b) => a + (b.score || 0), 0);
            const avg = total > 0 ? (sumScore / total).toFixed(1) : 0;
            setHistoryStats({
              totalExams: total,
              passedCount: passed,
              avgScore: avg,
              highestScore: highest,
            });
          }
        })
        .catch(() => {});
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateStudentProfile({
        name: formData.name.trim(),
        whatsapp: formData.whatsapp.trim(),
        location: {
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
        },
        education: {
          level: formData.educationLevel,
          institution: formData.institution.trim(),
          subject: formData.subject.trim(),
          passingYear: formData.passingYear,
        },
      });

      if (res.success) {
        addToast('প্রোফাইল সফলভাবে আপডেট করা হয়েছে।', 'success');
        setIsEditing(false);
      } else {
        addToast(res.message || 'আপডেট করা যায়নি।', 'error');
      }
    } catch {
      addToast('সার্ভার ত্রুটি। আবার চেষ্টা করুন।', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await studentLogout();
    addToast('আপনি লগআউট করেছেন।', 'info');
    navigate('/');
  };

  if (!student) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-slate-600 mb-4">প্রোফাইল দেখতে অনুগ্রহ করে লগইন করুন।</p>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-[#1c398e] text-white rounded-xl font-bold shadow-md hover:bg-[#152e75]"
        >
          লগইন পেজে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1c398e]/10 border-2 border-[#1c398e]/20 flex items-center justify-center text-[#1c398e] font-black text-2xl">
              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {student.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1c398e] border border-blue-100">
                  শিক্ষার্থী
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{student.email}</p>
              <p className="text-xs text-slate-500 mt-1 font-num">
                WhatsApp: {student.whatsapp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              <FiEdit2 />
              <span>{isEditing ? 'বাতিল করুন' : 'তথ্য পরিবর্তন'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              <FiLogOut />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <FiBarChart2 className="text-[#1c398e]" />
              <span>মোট পরীক্ষা</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-num">
              {historyStats.totalExams}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <FiCheckCircle className="text-emerald-600" />
              <span>উত্তীর্ণ পরীক্ষা</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 font-num">
              {historyStats.passedCount}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <FiAward className="text-amber-500" />
              <span>সর্বোচ্চ নম্বর</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-num">
              {historyStats.highestScore}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <FiClock className="text-blue-500" />
              <span>গড় স্কোর</span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-num">
              {historyStats.avgScore}
            </div>
          </div>
        </div>

        {/* Profile Details or Edit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiUser className="text-[#1c398e]" />
              <span>ব্যক্তিগত ও শিক্ষাগত তথ্য</span>
            </h2>
            <Link
              to="/history"
              className="text-xs sm:text-sm font-bold text-[#1c398e] hover:underline flex items-center gap-1"
            >
              পরীক্ষার ইতিহাস ও রেজাল্ট দেখুন →
            </Link>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    পূর্ণ নাম
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    WhatsApp নম্বর
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none font-num"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বিভাগ
                  </label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none"
                  >
                    <option value="">-- নির্বাচন করুন --</option>
                    {locationData.divisions.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    জেলা
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="জেলার নাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    উপজেলা / থানা
                  </label>
                  <input
                    type="text"
                    name="upazila"
                    value={formData.upazila}
                    onChange={handleChange}
                    placeholder="উপজেলার নাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    শিক্ষার স্তর
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none"
                  >
                    {EDUCATION_LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    পাসের বছর
                  </label>
                  <input
                    type="text"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleChange}
                    placeholder="যেমন: 2025"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none font-num"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    শিক্ষা প্রতিষ্ঠান
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="প্রতিষ্ঠানের নাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বিষয় / বিভাগ
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="বিষয়ের নাম"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-[#1c398e] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <FiSave />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">পূর্ণ নাম:</span>
                <p className="font-bold text-slate-800">{student.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">ইমেইল ঠিকানা:</span>
                <p className="font-bold text-slate-800">{student.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">WhatsApp নম্বর:</span>
                <p className="font-bold text-slate-800 font-num">{student.whatsapp}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">ঠিকানা / অবস্থান:</span>
                <p className="font-bold text-slate-800">
                  {[student.location?.upazila, student.location?.district, student.location?.division]
                    .filter(Boolean)
                    .join(', ') || 'প্রদান করা হয়নি'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">শিক্ষার স্তর:</span>
                <p className="font-bold text-slate-800">{student.education?.level || 'তথ্য নেই'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">শিক্ষা প্রতিষ্ঠান:</span>
                <p className="font-bold text-slate-800">{student.education?.institution || 'তথ্য নেই'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">বিষয় / বিভাগ:</span>
                <p className="font-bold text-slate-800">{student.education?.subject || 'তথ্য নেই'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">পাসের বছর:</span>
                <p className="font-bold text-slate-800 font-num">{student.education?.passingYear || 'তথ্য নেই'}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
