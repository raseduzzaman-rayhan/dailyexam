import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiArrowUpRight 
} from 'react-icons/fi';
import { FaFacebookF, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const { settings } = useSettings();
  const phone = settings?.whatsappNumber || '+880 1712-345678';
  const email = settings?.supportEmail || 'support@dailyexambd.com';
  const appName = settings?.appName || 'Daily Exam BD';

  return (
    <footer id="contact" className="bg-[#0c1836] text-slate-300 pt-16 pb-8 border-t border-blue-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Column 1: Brand & Logo (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/logo-circle.svg"
                alt={appName}
                className="h-12 w-12 object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              প্রতিদিনের অনলাইন পরীক্ষার মাধ্যমে নিজের প্রস্তুতি যাচাই করুন, ভুলগুলো চিহ্নিত করুন এবং প্রতিদিন আরও ভালো ফলাফলের দিকে এগিয়ে যান।
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#16274e] hover:bg-[#1e3568] border border-blue-900/50 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <FaFacebookF className="text-sm" />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="w-9 h-9 rounded-full bg-[#16274e] hover:bg-[#1e3568] border border-blue-900/50 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <FaEnvelope className="text-sm" />
              </a>
              <a
                href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-[#16274e] hover:bg-[#1e3568] border border-blue-900/50 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition"
              >
                <FaWhatsapp className="text-base" />
              </a>
            </div>
          </div>

          {/* Column 2: দ্রুত লিংক (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide">
              দ্রুত লিংক
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  আজকের পরীক্ষা
                </Link>
              </li>
              <li>
                <Link to="/all-exams" className="hover:text-white transition">
                  সকল পরীক্ষা
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition">
                  আমার ফলাফল
                </Link>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  যোগাযোগ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: যোগাযোগ (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-white font-bold text-base tracking-wide">
              যোগাযোগ
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <FiPhone className="text-base text-blue-400 shrink-0" />
                <span className="font-num">{phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-base text-blue-400 shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMapPin className="text-base text-blue-400 shrink-0" />
                <span>বাংলাদেশ</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Callout Card (Matching Reference Image) */}
        <div className="bg-[#122452] border border-blue-900/60 rounded-2xl p-5 sm:p-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-white font-bold text-base sm:text-lg">
              আজকের পরীক্ষাটি দিয়েছেন?
            </h4>
            <p className="text-xs sm:text-sm text-blue-200/80 mt-0.5">
              এখনই পরীক্ষা দিয়ে নিজের প্রস্তুতি যাচাই করুন।
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-sm transition shrink-0"
          >
            <span>পরীক্ষা দিন</span>
            <FiArrowUpRight className="text-base" />
          </Link>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="border-t border-blue-900/40 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} {appName}। সর্বস্বত্ব সংরক্ষিত
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">প্রাইভেসি পলিসি</span>
            <span className="hover:text-slate-400 cursor-pointer">শর্তাবলি</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
