import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client.js';
import Modal from '../../components/common/Modal.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { FiShield, FiPlus, FiTrash2, FiUserCheck, FiMail, FiLock, FiUser } from 'react-icons/fi';

export default function AdminManagementPage() {
  const { admin: currentAdmin } = useAuth();
  const { addToast } = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // New admin modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await api.get('/admins');
      if (res.data?.data) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('অ্যাডমিন তালিকা লোড ব্যর্থ হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      addToast('সকল তথ্য পূরণ করা আবশ্যক।', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/admins', {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });
      addToast('নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি সফল হয়েছে।', 'success');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchAdmins();
    } catch (err) {
      addToast(err.response?.data?.message || 'অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetAdmin) => {
    const nextStatus = targetAdmin.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/admins/${targetAdmin._id || targetAdmin.id}`, { status: nextStatus });
      addToast(`স্ট্যাটাস ${nextStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`, 'success');
      fetchAdmins();
    } catch (err) {
      addToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/admins/${deleteConfirmId}`);
      addToast('অ্যাডমিন মুছে ফেলা হয়েছে।', 'success');
      setDeleteConfirmId(null);
      fetchAdmins();
    } catch (err) {
      addToast(err.response?.data?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  const roleNames = {
    super_admin: 'সুপার অ্যাডমিন',
    admin: 'অ্যাডমিন',
    editor: 'কনটেন্ট এডিটর',
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            অ্যাডমিন ও রোল ম্যানেজমেন্ট
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            সুপার অ্যাডমিন, সাধারণ অ্যাডমিন এবং কনটেন্ট এডিটর অ্যাকাউন্ট পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c398e] hover:bg-[#152e75] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
        >
          <FiPlus className="text-base" />
          <span>নতুন অ্যাডমিন যোগ করুন</span>
        </button>
      </div>

      {/* Admins Table */}
      {loading ? (
        <LoadingState message="অ্যাডমিন তালিকা লোড হচ্ছে..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">নাম ও ভূমিকা</th>
                  <th className="py-3.5 px-4 sm:px-6">ইমেইল</th>
                  <th className="py-3.5 px-4 sm:px-6">রোল</th>
                  <th className="py-3.5 px-4 sm:px-6">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {admins.map((adm) => {
                  const isCurrent = String(adm._id || adm.id) === String(currentAdmin?._id || currentAdmin?.id);
                  return (
                    <tr key={adm._id || adm.id} className="hover:bg-slate-50/60 transition">
                      
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                            {adm.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {adm.name} {isCurrent && <span className="text-[10px] text-blue-600 font-normal">(আপনি)</span>}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 font-num text-xs text-slate-600">
                        {adm.email}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-xs">
                        <span className={`inline-block px-2.5 py-1 rounded-lg font-bold ${
                          adm.role === 'super_admin' ? 'bg-purple-50 text-purple-800' :
                          adm.role === 'admin' ? 'bg-blue-50 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {roleNames[adm.role] || adm.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-xs font-bold">
                        <button
                          disabled={isCurrent}
                          onClick={() => handleToggleStatus(adm)}
                          className={`px-2.5 py-1 rounded-full cursor-pointer transition ${
                            adm.status === 'active'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {adm.status === 'active' ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                        </button>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        {!isCurrent && adm.role !== 'super_admin' && (
                          <button
                            onClick={() => setDeleteConfirmId(adm._id || adm.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="মুছে ফেলুন"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পুরো নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: রাশেদ মাহমুদ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ইমেইল <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@exam.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পাসওয়ার্ড <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              রোল / ভূমিকা <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">সাধারণ অ্যাডমিন (ম্যানেজমেন্ট অ্যাক্সেস)</option>
              <option value="editor">কনটেন্ট এডিটর (শুধু প্রশ্ন ও পরীক্ষা এডিট)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-bold text-white bg-[#1c398e] hover:bg-[#152e75] rounded-xl shadow-xs transition cursor-pointer"
            >
              {submitting ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="অ্যাডমিন অ্যাকাউন্ট মুছুন"
        message="আপনি কি নিশ্চিত যে এই অ্যাকাউন্টটি মুছে ফেলতে চান?"
        confirmText="মুছে ফেলুন"
        confirmVariant="danger"
      />

    </div>
  );
}
