import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import { 
  FiClock, 
  FiFileText, 
  FiAward, 
  FiUser, 
  FiMapPin, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiArrowRight, 
  FiCalendar,
  FiShield
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function StudentInfoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const { student, firebaseUser } = useAuth();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState(() => student?.name || localStorage.getItem('last_student_name') || '');
  const [whatsapp, setWhatsapp] = useState(() => student?.whatsapp || localStorage.getItem('last_student_whatsapp') || '');
  const [address, setAddress] = useState(() => {
    if (student?.location) {
      return [student.location.upazila, student.location.district, student.location.division].filter(Boolean).join(', ');
    }
    return localStorage.getItem('last_student_address') || '';
  });
  const [agreeRules, setAgreeRules] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Update fields if student profile loads asynchronously
  useEffect(() => {
    if (student) {
      if (student.name) setName(student.name);
      if (student.whatsapp) setWhatsapp(student.whatsapp);
      if (student.location) {
        const fullAddr = [student.location.upazila, student.location.district, student.location.division].filter(Boolean).join(', ');
        if (fullAddr) setAddress(fullAddr);
      }
    }
  }, [student]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/public/${slug}`);
        if (res.data?.data) {
          setExam(res.data.data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'পরীক্ষাটি লোড করা সম্ভব হয়নি।');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [slug]);

  const handleStartExam = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('আপনার পুরো নাম লিখুন।');
      addToast('অনুগ্রহ করে আপনার নাম প্রদান করুন।', 'warning');
      return;
    }

    const cleanNum = whatsapp.replace(/\D/g, '');
    if (cleanNum.length < 11 || (!cleanNum.startsWith('01') && !cleanNum.startsWith('8801'))) {
      setErrorMsg('সঠিক ১১ ডিজিটের বাংলাদেশি WhatsApp নম্বর লিখুন (যেমন: 01711223344)।');
      addToast('সঠিক WhatsApp নম্বর প্রদান করুন।', 'warning');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('আপনার জেলা বা এলাকা/ঠিকানা লিখুন।');
      addToast('অনুগ্রহ করে ঠিকানা প্রদান করুন।', 'warning');
      return;
    }

    if (!agreeRules) {
      setErrorMsg('পরীক্ষার নিয়মাবলীর সাথে একমত হওয়া প্রয়োজন।');
      return;
    }

    // Save student details to localStorage for convenience in future tests
    localStorage.setItem('last_student_name', name.trim());
    localStorage.setItem('last_student_whatsapp', cleanNum);
    localStorage.setItem('last_student_address', address.trim());

    // Initialize session for this exam
    const sessionKey = `exam_session_${slug}`;
    const sessionData = {
      examSlug: slug,
      studentName: name.trim(),
      whatsappNumber: cleanNum,
      address: address.trim(),
      studentId: student?._id || null,
      firebaseUid: student?.firebaseUid || firebaseUser?.uid || null,
      startedAt: new Date().toISOString(),
      duration: exam.duration,
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));

    addToast('পরীক্ষা শুরু হচ্ছে! শুভকামনা!', 'success');
    navigate(`/exam/${slug}/take`);
  };

  if (loading) {
    return <LoadingState message="পরীক্ষার তথ্য লোড হচ্ছে..." />;
  }

  if (!exam) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <FiAlertCircle className="text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">পরীক্ষা পাওয়া যায়নি</h3>
        <p className="text-sm text-slate-500">
          {errorMsg || 'এই লিংকের পরীক্ষাটি বন্ধ রয়েছে অথবা লিংকটি ভুল।'}
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-[#1c398e] text-white rounded-xl text-sm font-semibold hover:bg-[#152e75] transition"
        >
          চলমান পরীক্ষাসমূহে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Brand Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <img
            src={settings?.logoUrl || '/logo.svg'}
            alt="Logo"
            className="h-12 w-auto mx-auto object-contain"
          />
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 font-num">
              <FiCalendar />
              <span>তারিখ: {exam.date}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {exam.title}
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              {exam.description || 'বিসিএস ও ভর্তি পরীক্ষার্থীদের জন্য আজকের বিশেষ অনলাইন মূল্যায়ন পরীক্ষা।'}
            </p>
          </div>

          {/* Exam Specs Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto font-num">
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span className="text-xs text-blue-800 block font-sans">মোট প্রশ্ন</span>
              <span className="text-base sm:text-lg font-extrabold text-blue-900">
                {exam.totalQuestions}টি
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-sans">সময়সীমা</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800">
                {exam.duration} মিনিট
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-sans">মোট নম্বর</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800">
                {exam.totalMarks}
              </span>
            </div>
          </div>
        </div>

        {/* Student Information Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-[#1c398e] rounded-full inline-block" />
                শিক্ষার্থীর পরিচয় ও তথ্য প্রদান
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                পরীক্ষায় অংশ নিতে নিচের ফর্মটি সঠিকভাবে পূরণ করুন। রেজাল্ট সংরক্ষণের জন্য তথ্যগুলো প্রয়োজনীয়।
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setName('তানভীর মাহমুদ');
                setWhatsapp('01712345678');
                setAddress('মিরপুর, ঢাকা');
                setAgreeRules(true);
                setErrorMsg('');
              }}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚡ ডেমো তথ্য পূরণ</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <FiAlertCircle className="text-lg shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-5">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                আপনার পুরো নাম <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: সাকিব আল হাসান"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50/50"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                WhatsApp নম্বর <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FaWhatsapp className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-base" />
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50/50 font-num"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                এই নম্বরে পরীক্ষার ফলাফল ও সমাধান ট্র্যাক করা হবে। কোনো ওটিপি প্রয়োজন নেই।
              </p>
            </div>

            {/* Address / Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                ঠিকানা / জেলা <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: ধানমন্ডি, ঢাকা অথবা রাজশাহী সদর"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50/50"
                />
              </div>
            </div>

            {/* Instructions box */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <FiShield className="text-blue-700" />
                পরীক্ষার সাধারণ নিয়মাবলী:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                <li>পরীক্ষা শুরু করার পর নির্দিষ্ট সময়সীমার মধ্যে সব প্রশ্নের উত্তর দিতে হবে।</li>
                <li>সময় শেষ হওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে খাতা জমা হয়ে যাবে।</li>
                <li>পরীক্ষা চলাকালীন ট্যাব পরিবর্তন না করার অনুরোধ করা হচ্ছে।</li>
                <li>একবার জমা দিলে পরবর্তীতে বিস্তারিত সমাধান ও লিডারবোর্ড দেখা যাবে।</li>
              </ul>
            </div>

            {/* Agree checkbox */}
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeRules}
                onChange={(e) => setAgreeRules(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>আমি নিয়মাবলী পড়েছি এবং পরীক্ষায় অংশ নিতে সম্মত আছি।</span>
            </label>

            {/* Submit & Start Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1c398e] hover:bg-[#152e75] active:bg-[#0f246e] text-white font-bold text-base shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>পরীক্ষা শুরু করুন</span>
              <FiArrowRight className="text-lg" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
