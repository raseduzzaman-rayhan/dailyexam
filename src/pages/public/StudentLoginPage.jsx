import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { FiMail, FiLock, FiArrowRight, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentLogin, studentGoogleLogin } = useAuth();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('ইমেইল এবং পাসওয়ার্ড উভয়ই আবশ্যক।');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await studentLogin(email.trim(), password);
      if (res.success) {
        if (res.isAdmin) {
          addToast(res.isSuperAdmin ? 'স্বাগতম প্রধান প্রশাসক (Super Admin)!' : 'স্বাগতম অ্যাডমিন!', 'success');
          navigate(redirectPath.startsWith('/admin') ? redirectPath : '/admin/dashboard', { replace: true });
        } else {
          addToast('স্বাগতম! আপনি সফলভাবে লগইন করেছেন।', 'success');
          navigate(redirectPath.startsWith('/admin') ? '/' : redirectPath, { replace: true });
        }
      } else if (res.needProfile) {
        addToast('অনুগ্রহ করে আপনার প্রোফাইলের তথ্য সম্পন্ন করুন।', 'info');
        navigate('/register', { state: { email, from: redirectPath } });
      } else {
        setErrorMsg(res.message);
        addToast(res.message, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'লগইন প্রক্রিয়ায় ত্রুটি হয়েছে।';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const res = await studentGoogleLogin();
      if (res.success) {
        if (res.isAdmin) {
          addToast(res.isSuperAdmin ? 'স্বাগতম প্রধান প্রশাসক (Super Admin)!' : 'স্বাগতম অ্যাডমিন!', 'success');
          navigate(redirectPath.startsWith('/admin') ? redirectPath : '/admin/dashboard', { replace: true });
        } else if (res.needProfile) {
          addToast('প্রোফাইলের তথ্য সম্পন্ন করতে রেজিস্ট্রেশন পেজে যান।', 'info');
          navigate('/register', {
            state: {
              email: res.fbUser?.email || '',
              name: res.fbUser?.displayName || '',
              photoURL: res.fbUser?.photoURL || '',
              from: redirectPath,
            },
          });
        } else {
          addToast('গুগল দিয়ে সফলভাবে লগইন সম্পন্ন হয়েছে!', 'success');
          navigate(redirectPath.startsWith('/admin') ? '/' : redirectPath, { replace: true });
        }
      } else {
        setErrorMsg(res.message || 'গুগল লগইন ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setErrorMsg('গুগল অ্যাকাউন্ট দিয়ে লগইন করা যায়নি।');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-5">
        
        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <img
              src={settings?.logoUrl || '/logo-circle.svg'}
              alt="Logo"
              className="h-12 w-auto mx-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                লগইন করুন
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                আপনার অ্যাকাউন্টে প্রবেশ করে মডেল টেস্ট দিন অথবা ড্যাশবোর্ড পরিচালনা করুন
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm shadow-xs transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <FcGoogle className="text-xl" />
            <span>গুগল দিয়ে প্রবেশ করুন</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">অথবা ইমেইলে লগইন</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  পাসওয়ার্ড
                </label>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="password"
                  required
                  placeholder="আপনার পাসওয়ার্ড দিন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1c398e] text-sm bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
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

          <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
            অ্যাকাউন্ট নেই?{' '}
            <Link
              to="/register"
              state={{ from: location.state?.from }}
              className="font-bold text-[#1c398e] hover:underline inline-flex items-center gap-1"
            >
              <FiUserPlus className="inline" /> নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
