import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { FiLock, FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('ইমেইল এবং পাসওয়ার্ড উভয়ই আবশ্যক।');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        addToast('অ্যাডমিন প্যানেলে স্বাগতম!', 'success');
        navigate('/admin/dashboard');
      } else {
        setErrorMsg(res.message || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে।');
        addToast(res.message || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে।';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition"
          >
            <FiArrowLeft />
            <span>শিক্ষার্থী পোর্টালে ফিরে যান</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
          
          <div className="text-center space-y-3">
            <img
              src={settings?.logoUrl || '/logo-circle.svg'}
              alt="Logo"
              className="h-12 w-auto mx-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-black text-slate-900">
                অ্যাডমিন সাইন-ইন
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                মডেল টেস্ট, প্রশ্ন ব্যাংক এবং রেজাল্ট পরিচালনার জন্য প্রবেশ করুন
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ইমেইল ঠিকানা বা ইউজারনেম
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  placeholder="আপনার ইমেইল বা ইউজারনেম লিখুন"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 font-num"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="password"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50 font-num"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#1c398e] hover:bg-[#152e75] active:bg-[#0f246e] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>যাচাই করা হচ্ছে...</span>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              পরীক্ষামূলক অ্যাডমিন একাউন্ট
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@exam.bd');
                  setPassword('admin123');
                }}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800">Super Admin</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">admin@exam.bd</div>
                <div className="text-[10px] text-blue-600 font-mono">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('editor@exam.bd');
                  setPassword('editor123');
                }}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800">Content Editor</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">editor@exam.bd</div>
                <div className="text-[10px] text-blue-600 font-mono">editor123</div>
              </button>
            </div>
          </div>

        </div>

        <div className="text-center text-xs text-slate-500">
          সুরক্ষিত অ্যাডমিন পোর্টাল • {settings?.appName || 'Daily Exam BD'}
        </div>

      </div>
    </div>
  );
}
