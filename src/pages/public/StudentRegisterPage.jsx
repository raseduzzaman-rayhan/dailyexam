import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import locationData from '../../data/locationData.json';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiArrowRight,
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

const PASSING_YEARS = Array.from({ length: 15 }, (_, i) => String(2027 - i));

export default function StudentRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentRegister } = useAuth();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const stateData = location.state || {};
  const redirectPath = stateData.from?.pathname || '/';

  // Form State
  const [formData, setFormData] = useState({
    name: stateData.name || '',
    email: stateData.email || '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
    division: '',
    district: '',
    upazila: '',
    educationLevel: 'ডিগ্রি / অনার্স',
    institution: '',
    subject: '',
    passingYear: '2025',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic District options based on chosen Division
  const availableDistricts = useMemo(() => {
    if (!formData.division) return [];
    const div = locationData.divisions.find((d) => d.name === formData.division);
    return div ? div.districts : [];
  }, [formData.division]);

  // Dynamic Upazila options based on chosen District
  const availableUpazilas = useMemo(() => {
    if (!formData.district) return [];
    const dist = availableDistricts.find((d) => d.name === formData.district);
    return dist ? dist.upazilas : [];
  }, [formData.district, availableDistricts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'division') {
        updated.district = '';
        updated.upazila = '';
      } else if (name === 'district') {
        updated.upazila = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.name.trim()) {
      setErrorMsg('আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('ইমেইল ঠিকানা আবশ্যক।');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('উভয় পাসওয়ার্ড মেলেনি। দয়া করে সঠিক পাসওয়ার্ড দিন।');
      return;
    }

    const cleanWhatsApp = formData.whatsapp.replace(/\D/g, '');
    if (cleanWhatsApp.length < 10 || cleanWhatsApp.length > 15) {
      setErrorMsg('সঠিক WhatsApp নম্বর প্রদান করুন (যেমন: 01711223344)।');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        whatsapp: cleanWhatsApp,
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
      };

      const res = await studentRegister(payload);
      if (res.success) {
        if (res.isFirstUser || res.isAdmin) {
          addToast('অভিনন্দন! আপনি প্রথম ব্যবহারকারী হিসেবে প্রধান প্রশাসক (Super Admin) মনোনীত হয়েছেন।', 'success');
          navigate('/admin/dashboard', { replace: true });
        } else {
          addToast('রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে! স্বাগতম।', 'success');
          navigate(redirectPath, { replace: true });
        }
      } else {
        setErrorMsg(res.message);
        addToast(res.message, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'রেজিস্ট্রেশন প্রক্রিয়ায় ত্রুটি হয়েছে।';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={settings?.logoUrl || '/logo-circle.svg'}
            alt="Logo"
            className="h-12 w-auto mx-auto object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            শিক্ষার্থী নিবন্ধন
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            আপনার সঠিক তথ্য প্রদান করে অ্যাকাউন্ট তৈরি করুন এবং দৈনিক পরীক্ষায় অংশগ্রহণ করুন
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-8">
          
          {/* SECTION 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c398e] border-b border-slate-100 pb-2">
              <FiUser className="text-base" />
              <span>মৌলিক তথ্য (Basic Information)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  সম্পূর্ণ নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="যেমন: মোঃ আব্দুল্লাহ"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ইমেইল ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পাসওয়ার্ড <span className="text-rose-500">*</span> (কমপক্ষে ৬ অক্ষর)
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c398e] border-b border-slate-100 pb-2">
              <FiPhone className="text-base" />
              <span>যোগাযোগের তথ্য (Contact)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                WhatsApp নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                required
                placeholder="যেমন: 01711223344"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50 font-num"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                পরীক্ষার ফলাফল এবং গুরুত্বপূর্ণ নোটিশ WhatsApp-এ পাওয়ার জন্য সঠিক নম্বর দিন
              </p>
            </div>
          </div>

          {/* SECTION 3: Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c398e] border-b border-slate-100 pb-2">
              <FiMapPin className="text-base" />
              <span>ঠিকানা (Location)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  বিভাগ (Division)
                </label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                >
                  <option value="">-- বিভাগ নির্বাচন করুন --</option>
                  {locationData.divisions.map((div) => (
                    <option key={div.name} value={div.name}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  জেলা (District)
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.division}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50 disabled:opacity-50"
                >
                  <option value="">-- জেলা নির্বাচন করুন --</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist.name} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  উপজেলা / থানা (Upazila)
                </label>
                <select
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50 disabled:opacity-50"
                >
                  <option value="">-- উপজেলা নির্বাচন করুন --</option>
                  {availableUpazilas.map((upz) => (
                    <option key={upz} value={upz}>
                      {upz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Education */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1c398e] border-b border-slate-100 pb-2">
              <FiBookOpen className="text-base" />
              <span>শিক্ষাগত যোগ্যতা (Education)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  শিক্ষার স্তর (Level)
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পাসের বছর (Passing Year)
                </label>
                <select
                  name="passingYear"
                  value={formData.passingYear}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50 font-num"
                >
                  {PASSING_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  শিক্ষা প্রতিষ্ঠান (Institution)
                </label>
                <input
                  type="text"
                  name="institution"
                  placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  বিষয় / বিভাগ (Subject / Department)
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="যেমন: রাষ্ট্রবিজ্ঞান / রসায়ন"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1c398e] hover:bg-[#152e75] active:bg-[#0f246e] text-white font-bold text-base shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
            ) : (
              <>
                <FiCheckCircle className="text-lg" />
                <span>নিবন্ধন সম্পন্ন করুন</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs sm:text-sm text-slate-600">
          ইতিমধ্যে অ্যাকাউন্ট রয়েছে?{' '}
          <Link
            to="/login"
            state={{ from: stateData.from }}
            className="font-bold text-[#1c398e] hover:underline"
          >
            লগইন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}
