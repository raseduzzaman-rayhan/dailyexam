import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  FiCheckSquare, 
  FiList, 
  FiBarChart2, 
  FiPhone, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiAward,
  FiBookOpen
} from 'react-icons/fi';

export default function Navbar({ onShowAllExams }) {
  const { settings } = useSettings();
  const { admin, student } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isAllExams = location.pathname === '/all-exams';

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Brand Circular Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo-circle.svg"
              alt={settings?.appName || 'Daily Exam BD'}
              className="h-11 w-11 sm:h-12 sm:w-12 object-contain hover:scale-105 transition-transform"
            />
          </Link>

          {/* Center Navigation Links (Matching Reference) */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* আজকের পরীক্ষা */}
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs ${
                isHome
                  ? 'bg-[#13203c] text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <FiCheckSquare className="text-base" />
              <span>আজকের পরীক্ষা</span>
            </Link>

            {/* সকল পরীক্ষা */}
            <Link
              to="/all-exams"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isAllExams
                  ? 'bg-[#13203c] text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <FiList className="text-base text-slate-500" />
              <span>সকল পরীক্ষা</span>
            </Link>

            {/* আমার ফলাফল */}
            <Link
              to="/history"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                location.pathname === '/history'
                  ? 'bg-[#13203c] text-white'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <FiBarChart2 className="text-base text-slate-500" />
              <span>আমার ফলাফল</span>
            </Link>

            {/* যোগাযোগ (Scrolls to Footer Contact) */}
            <a
              href="#contact"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
            >
              <FiPhone className="text-base text-slate-500" />
              <span>যোগাযোগ</span>
            </a>
          </nav>

          {/* Right Action: Student Login / Profile / Admin Dashboard */}
          <div className="hidden md:flex items-center gap-3">
            {admin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#13203c] hover:bg-slate-800 rounded-xl shadow-xs transition-all"
              >
                <FiUser className="text-sm" />
                <span>ড্যাশবোর্ড</span>
              </Link>
            )}

            {student ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 text-slate-800 font-bold text-sm transition"
              >
                <div className="w-7 h-7 rounded-full bg-[#1c398e] text-white flex items-center justify-center text-xs font-bold">
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span className="max-w-[120px] truncate">{student.name}</span>
              </Link>
            ) : !admin && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-[#1c398e] hover:bg-blue-50/50 rounded-xl transition"
                >
                  <FiUser className="text-base" />
                  <span>লগইন</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[#1c398e] hover:bg-[#152e75] rounded-xl shadow-xs transition"
                >
                  <span>নিবন্ধন</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
              isHome ? 'bg-[#13203c] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiCheckSquare />
            <span>আজকের পরীক্ষা</span>
          </Link>

          <Link
            to="/all-exams"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
              isAllExams ? 'bg-[#13203c] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiList />
            <span>সকল পরীক্ষা</span>
          </Link>

          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
              location.pathname === '/history' ? 'bg-[#13203c] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiBarChart2 />
            <span>আমার ফলাফল</span>
          </Link>

          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FiPhone />
            <span>যোগাযোগ</span>
          </a>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {admin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold text-white bg-[#13203c] rounded-xl shadow-xs"
              >
                <FiUser />
                <span>অ্যাডমিন ড্যাশবোর্ড</span>
              </Link>
            )}
            {student ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-bold text-slate-800 bg-slate-100 hover:bg-blue-50 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-[#1c398e] text-white flex items-center justify-center text-xs">
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span>প্রোফাইল ({student.name})</span>
              </Link>
            ) : !admin && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-[#1c398e] border border-[#1c398e]/20 rounded-xl"
                >
                  <span>লগইন</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-[#1c398e] rounded-xl shadow-xs"
                >
                  <span>নিবন্ধন</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
