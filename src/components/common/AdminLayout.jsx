import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { 
  FiHome, 
  FiLayers, 
  FiHelpCircle, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiSettings, 
  FiShield, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiExternalLink,
  FiAward
} from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const { admin, logout, isSuperAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'ড্যাশবোর্ড', path: '/admin/dashboard', icon: FiHome },
    { label: 'পরীক্ষা ব্যবস্থাপনা', path: '/admin/exams', icon: FiLayers },
    { label: 'প্রশ্ন ব্যাংক', path: '/admin/questions', icon: FiHelpCircle },
    { label: 'শিক্ষার্থী তালিকা', path: '/admin/students', icon: FiUsers },
    { label: 'জমাকৃত ফলাফল', path: '/admin/submissions', icon: FiFileText },
    { label: 'অ্যানালিটিক্স ও রিপোর্ট', path: '/admin/analytics', icon: FiBarChart2 },
    ...(isSuperAdmin ? [{ label: 'অ্যাডমিন পরিচালনা', path: '/admin/admins', icon: FiShield }] : []),
    ...(isSuperAdmin ? [{ label: 'সিস্টেম সেটিংস', path: '/admin/settings', icon: FiSettings }] : []),
  ];

  const roleNames = {
    super_admin: 'সুপার অ্যাডমিন',
    admin: 'অ্যাডমিন',
    editor: 'কনটেন্ট এডিটর',
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img
            src={settings?.logoUrl || '/logo.svg'}
            alt="Logo"
            className="h-8 w-auto bg-white p-1 rounded-lg"
          />
          <span className="font-bold text-sm">অ্যাডমিন প্যানেল</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Sidebar for Desktop */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <img
            src={settings?.logoUrl || '/logo.svg'}
            alt="Logo"
            className="h-9 w-auto bg-white p-1.5 rounded-xl shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-bold text-white text-sm truncate">
              {settings?.appName || 'Daily Exam BD'}
            </h2>
            <span className="text-[11px] text-blue-400 block font-medium">
              অ্যাডমিন কন্ট্রোল প্যানেল
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1c398e] text-white font-bold flex items-center justify-center text-sm">
            {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-white text-xs block truncate">
              {admin?.name || 'Admin'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate font-num">
              {roleNames[admin?.role] || 'Admin'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1c398e] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="text-base shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
          >
            <span className="flex items-center gap-2">
              <FiExternalLink />
              <span>পাবলিক পোর্টাল দেখুন</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left cursor-pointer"
          >
            <FiLogOut />
            <span>লগআউট (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
