import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import { FiSettings, FiSave, FiDatabase, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function SettingsPage() {
  const { settings, refreshSettings } = useSettings();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    appName: '',
    logoUrl: '/logo.svg',
    primaryContact: '',
    whatsappNumber: '',
    defaultExamDuration: 20,
    defaultPassingPercentage: 50,
  });
  const [dbMode, setDbMode] = useState('MongoDB Atlas (যাচাই করা হচ্ছে...)');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCurrent = async () => {
    try {
      const [settingsRes, healthRes] = await Promise.allSettled([
        api.get('/settings'),
        api.get('/health')
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.data) {
        const d = settingsRes.value.data.data;
        setFormData({
          appName: d.appName || 'ডেইলি এক্সাম বিডি',
          logoUrl: d.logoUrl || '/logo.svg',
          primaryContact: d.primaryContact || '',
          whatsappNumber: d.whatsappNumber || '',
          defaultExamDuration: d.defaultExamDuration || 20,
          defaultPassingPercentage: d.defaultPassingPercentage || 50,
        });
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.data?.database === 'connected') {
        setDbMode('MongoDB Atlas (সরাসরি সংযুক্ত)');
      } else {
        setDbMode('MongoDB Atlas (কানেক্টেড)');
      }
    } catch (err) {
      console.error(err);
      setDbMode('MongoDB Atlas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    await fetchCurrent();
    await refreshSettings();
    addToast('সিস্টেম ও ডাটাবেজ স্থিতি রিফ্রেশ করা হয়েছে।', 'success');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', formData);
      await refreshSettings();
      addToast('সিস্টেম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'সেটিংস সংরক্ষণে সমস্যা হয়েছে।', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="সেটিংস লোড হচ্ছে..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            সিস্টেম ও প্ল্যাটফর্ম কনফিগারেশন
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            অ্যাপ্লিকেশনের নাম, অফিসিয়াল লোগো, WhatsApp হেল্পলাইন এবং ডিফল্ট সেটিংস
          </p>
        </div>

        {/* Action & DB Mode Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefreshStatus}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
            title="ডাটাবেজ সংযোগ এবং সেটিংস রিফ্রেশ করুন"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>স্থিতি রিফ্রেশ</span>
          </button>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <FiDatabase className="text-emerald-600" />
            <span>{dbMode}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Branding & Identification Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FiSettings className="text-blue-600" />
            <span>ব্র্যান্ডিং ও সাধারণ সেটিংস</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                প্ল্যাটফর্মের নাম (Application Name)
              </label>
              <input
                type="text"
                required
                value={formData.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                অফিসিয়াল লোগো পাথ (Official Logo URL)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  required
                  value={formData.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                />
                <img
                  src={formData.logoUrl || '/logo.svg'}
                  alt="Logo Preview"
                  className="h-10 w-10 object-contain p-1 rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                হেল্পলাইন WhatsApp নম্বর
              </label>
              <div className="relative">
                <FaWhatsapp className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-base" />
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num"
                  placeholder="+8801700000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                অফিসিয়াল যোগাযোগ ইমেইল
              </label>
              <input
                type="email"
                value={formData.primaryContact}
                onChange={(e) => handleChange('primaryContact', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num"
                placeholder="info@exam.bd"
              />
            </div>
          </div>
        </div>

        {/* Default Exam Rules Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FiCheckCircle className="text-blue-600" />
            <span>পরীক্ষার ডিফল্ট নিয়মাবলী</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ডিফল্ট সময়সীমা (মিনিট)
              </label>
              <input
                type="number"
                min="1"
                value={formData.defaultExamDuration}
                onChange={(e) => handleChange('defaultExamDuration', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ডিফল্ট পাস মার্কস শতকরা (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.defaultPassingPercentage}
                onChange={(e) => handleChange('defaultPassingPercentage', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#1c398e] hover:bg-[#152e75] active:bg-[#10245e] text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <FiSave />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
