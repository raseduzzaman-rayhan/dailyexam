import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';

function LayoutShell({ children }) {
  const location = useLocation();
  const isTakeExam = location.pathname.includes('/take');
  const isAdmin = location.pathname.startsWith('/admin');

  const content = children || <Outlet />;

  // Do not show public Navbar & Footer during live exam or inside admin panel
  if (isTakeExam || isAdmin) {
    return content;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
