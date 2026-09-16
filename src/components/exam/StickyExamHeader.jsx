import React from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { FiClock, FiCheckCircle, FiMaximize, FiMinimize, FiSend, FiAlertCircle } from 'react-icons/fi';

export default function StickyExamHeader({
  title,
  timeLeftSeconds,
  totalQuestions,
  answeredCount,
  onSubmitClick,
  isFullscreen,
  toggleFullscreen,
}) {
  const { settings } = useSettings();

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Time warning states: 5m (300s), 2m (120s), 1m (60s)
  const isDanger = timeLeftSeconds <= 60;
  const isWarning = timeLeftSeconds > 60 && timeLeftSeconds <= 300;

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Exam Title */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={settings?.logoUrl || '/logo.svg'}
              alt="Logo"
              className="h-8 sm:h-9 w-auto shrink-0 hidden xs:block"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-600">
                  উত্তর: {answeredCount} / {totalQuestions}
                </span>
                <span>•</span>
                <span>অগ্রগতি: {progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Timer & Submit Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-num font-bold text-sm sm:text-base transition-all ${
                isDanger
                  ? 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse'
                  : isWarning
                  ? 'bg-amber-50 border-amber-400 text-amber-600'
                  : 'bg-blue-50 border-blue-300 text-blue-700'
              }`}
            >
              <FiClock className="text-base sm:text-lg" />
              <span>{timeFormatted}</span>
            </div>

            {/* Fullscreen Toggle (Optional on desktop) */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              title={isFullscreen ? 'ফুলস্ক্রিন বন্ধ করুন' : 'ফুলস্ক্রিন চালু করুন'}
            >
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </button>

            {/* Submit Action */}
            <button
              onClick={onSubmitClick}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#1c398e] hover:bg-[#152e75] rounded-xl shadow-xs transition active:scale-95"
            >
              <FiSend />
              <span>জমা দিন</span>
            </button>

          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
}
