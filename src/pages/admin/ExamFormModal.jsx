import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/common/Modal.jsx';
import api from '../../api/client.js';
import { useToast } from '../../components/common/Toast.jsx';
import SubjectDistributionTable from '../../components/admin/SubjectDistributionTable.jsx';
import CustomQuestionPicker from '../../components/admin/CustomQuestionPicker.jsx';
import SelectionPreviewList from '../../components/admin/SelectionPreviewList.jsx';
import {
  FiCheck,
  FiSearch,
  FiHelpCircle,
  FiCpu,
  FiEdit3,
  FiLayers,
  FiArrowRight,
  FiArrowLeft,
  FiSave,
  FiAlertCircle
} from 'react-icons/fi';

export default function ExamFormModal({ isOpen, onClose, onSaved, editExam = null }) {
  const { addToast } = useToast();

  // Active Wizard Step
  const [activeStep, setActiveStep] = useState('basic'); // 'basic' | 'distribution' | 'custom_pick' | 'preview'

  // Basic Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [duration, setDuration] = useState(20);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [passingPercentage, setPassingPercentage] = useState(50);
  const [status, setStatus] = useState('published');
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);

  // Selection Mode State
  const [selectionMode, setSelectionMode] = useState('auto'); // 'auto' | 'custom' | 'hybrid'
  const [distribution, setDistribution] = useState({});
  const [availabilitySummary, setAvailabilitySummary] = useState([]);
  const [allBankQuestions, setAllBankQuestions] = useState([]);

  // Selected Questions State
  const [manualQuestionIds, setManualQuestionIds] = useState([]);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generateSlugSuggestion = (text, examDate) => {
    const clean = (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const dClean = (examDate || date || new Date().toISOString().split('T')[0]).replace(/[^0-9]/g, '');
    return clean ? `${clean}-${dClean}` : `daily-exam-${dClean}`;
  };

  // Fetch meta availability summary and bank questions
  const loadMetaAndQuestions = useCallback(async () => {
    try {
      const [availRes, qRes] = await Promise.all([
        api.get('/questions/meta/availability-summary', {
          params: { excludeExamId: editExam?._id }
        }),
        api.get('/questions', {
          params: { excludeExamId: editExam?._id }
        })
      ]);

      if (availRes.data?.data) {
        setAvailabilitySummary(availRes.data.data);
      }
      if (qRes.data?.data) {
        setAllBankQuestions(qRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load availability meta:', err);
    }
  }, [editExam]);

  useEffect(() => {
    if (isOpen) {
      loadMetaAndQuestions();
      setActiveStep('basic');

      if (editExam) {
        setTitle(editExam.title || '');
        setSlug(editExam.slug || '');
        setDescription(editExam.description || '');
        setDate(editExam.date || new Date().toISOString().split('T')[0]);
        setStartTime(editExam.startTime || '00:00');
        setEndTime(editExam.endTime || '23:59');
        setDuration(editExam.duration || 20);
        setTotalQuestions(editExam.questions ? editExam.questions.length : 20);
        setMarksPerQuestion(editExam.marksPerQuestion || 1);
        setNegativeMarks(editExam.negativeMarks || 0);
        setPassingPercentage(editExam.passingPercentage || 50);
        setStatus(editExam.status || 'published');
        setLeaderboardEnabled(editExam.leaderboardEnabled ?? true);
        setRandomizeQuestions(editExam.randomizeQuestions ?? false);
        setRandomizeOptions(editExam.randomizeOptions ?? false);

        setSelectionMode(editExam.selectionMode || 'custom');
        setDistribution(editExam.subjectDistribution || {});

        const initialManualIds = (editExam.manualQuestionIds || []).map((q) =>
          typeof q === 'object' && q?._id ? String(q._id) : String(q)
        );
        setManualQuestionIds(initialManualIds);

        const initialQuestions = (editExam.questions || []).map((q) => {
          if (typeof q === 'object' && q !== null) return q;
          return { _id: q, questionText: 'Question', subject: 'সাধারণ' };
        });
        setPreviewQuestions(initialQuestions);
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        setTitle('');
        setSlug('');
        setDescription('');
        setDate(todayStr);
        setStartTime('00:00');
        setEndTime('23:59');
        setDuration(20);
        setTotalQuestions(20);
        setMarksPerQuestion(1);
        setNegativeMarks(0);
        setPassingPercentage(50);
        setStatus('published');
        setLeaderboardEnabled(true);
        setRandomizeQuestions(false);
        setRandomizeOptions(false);
        setSelectionMode('auto');
        setDistribution({});
        setManualQuestionIds([]);
        setPreviewQuestions([]);
      }
    }
  }, [isOpen, editExam, loadMetaAndQuestions]);

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    if (!editExam) {
      const currentAutoSlug = generateSlugSuggestion(title, date);
      if (!slug || slug === currentAutoSlug) {
        setSlug(generateSlugSuggestion(newTitle, date));
      }
    }
  };

  const handleToggleManualQuestion = (qId) => {
    const sId = String(qId);
    setManualQuestionIds((prev) => {
      if (prev.includes(sId)) {
        return prev.filter((id) => id !== sId);
      }
      return [...prev, sId];
    });
  };

  // Preview Generation Trigger
  const handleGeneratePreview = async () => {
    // Validate distribution in Auto or Hybrid mode
    if (selectionMode === 'auto' || selectionMode === 'hybrid') {
      const sum = Object.values(distribution).reduce((acc, val) => acc + (Number(val) || 0), 0);
      if (sum !== Number(totalQuestions)) {
        addToast(
          `বিষয়ভিত্তিক প্রশ্নের মোট সংখ্যা (${sum}) অবশ্যই নির্ধারিত মোট প্রশ্নের সংখ্যার (${totalQuestions}) সমান হতে হবে।`,
          'warning'
        );
        return;
      }
    }

    if (selectionMode === 'custom' && manualQuestionIds.length === 0) {
      addToast('অনুগ্রহ করে অন্তত ১টি প্রশ্ন নির্বাচন করুন।', 'warning');
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await api.post('/exams/preview-selection', {
        selectionMode,
        totalQuestions: Number(totalQuestions),
        distribution,
        manualQuestionIds,
        excludeExamId: editExam?._id
      });

      if (res.data?.success && res.data?.data) {
        setPreviewQuestions(res.data.data.questions || []);
        setActiveStep('preview');
        addToast('প্রশ্ন সফলভাবে নির্বাচন ও লোড করা হয়েছে।', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'প্রশ্ন নির্বাচন ব্যর্থ হয়েছে।';
      addToast(msg, 'error', 6000);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Re-shuffle one subject
  const handleRegenerateSubject = async (targetSubject) => {
    setIsRegenerating(true);
    try {
      const currentIds = previewQuestions.map((q) => String(q._id || q.id));
      const res = await api.post('/exams/regenerate-selection', {
        distribution,
        manualQuestionIds,
        currentQuestionIds: currentIds,
        targetSubject,
        excludeExamId: editExam?._id
      });

      if (res.data?.success && res.data?.data?.questions) {
        const newSubjectQuestions = res.data.data.questions;
        // Replace questions for targetSubject in previewQuestions
        setPreviewQuestions((prev) => {
          const others = prev.filter((q) => (q.subject || 'সাধারণ') !== targetSubject);
          return [...others, ...newSubjectQuestions];
        });
        addToast(`"${targetSubject}" বিষয়ের প্রশ্ন সফলভাবে পরিবর্তন করা হয়েছে।`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'রিশাফল ব্যর্থ হয়েছে।', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Re-shuffle all automatic questions
  const handleRegenerateAll = async () => {
    handleGeneratePreview();
  };

  // Remove a single question from preview
  const handleRemoveFromPreview = (qId) => {
    const sId = String(qId);
    setPreviewQuestions((prev) => prev.filter((q) => String(q._id || q.id) !== sId));
    setManualQuestionIds((prev) => prev.filter((id) => id !== sId));
  };

  // Final Form Submission
  const handleSubmitExam = async () => {
    if (!title.trim()) {
      addToast('পরীক্ষার নাম প্রদান করা আবশ্যক।', 'warning');
      setActiveStep('basic');
      return;
    }

    if (previewQuestions.length === 0) {
      addToast('পরীক্ষার জন্য অন্তত ১টি প্রশ্ন চূড়ান্ত থাকতে হবে।', 'warning');
      return;
    }

    const questionIds = previewQuestions.map((q) => String(q._id || q.id)).filter(Boolean);

    setSubmitting(true);
    try {
      const totalMarks = questionIds.length * (Number(marksPerQuestion) || 1);

      const payload = {
        title: title.trim(),
        slug: slug ? slug.trim() : undefined,
        description: description.trim(),
        date,
        startTime,
        endTime,
        duration: Number(duration),
        totalMarks,
        marksPerQuestion: Number(marksPerQuestion),
        negativeMarks: Number(negativeMarks),
        passingPercentage: Number(passingPercentage),
        status,
        leaderboardEnabled,
        randomizeQuestions,
        randomizeOptions,
        selectionMode,
        subjectDistribution: distribution,
        manualQuestionIds,
        questions: questionIds
      };

      if (editExam) {
        await api.put(`/exams/${editExam._id}`, payload);
        addToast('পরীক্ষা সফলভাবে আপডেট করা হয়েছে।', 'success');
      } else {
        await api.post('/exams', payload);
        addToast('মডেল টেস্ট পরীক্ষা সফলভাবে তৈরি ও সংরক্ষিত হয়েছে।', 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'পরীক্ষা সংরক্ষণ ব্যর্থ হয়েছে।';
      addToast(msg, 'error', 6000);
    } finally {
      setSubmitting(false);
    }
  };

  // Step Indicator Config
  const steps = [
    { id: 'basic', label: '১. মৌলিক তথ্য' },
    { id: 'distribution', label: '২. সিলেকশন ও বণ্টন' },
    ...(selectionMode !== 'auto' ? [{ id: 'custom_pick', label: '৩. কাস্টম প্রশ্ন' }] : []),
    { id: 'preview', label: '৪. প্রিভিউ ও রিভিউ' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editExam ? 'মডেল টেস্ট পরীক্ষা সম্পাদনা করুন' : 'নতুন স্মার্ট মডেল টেস্ট তৈরি করুন'}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Wizard Steps Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 overflow-x-auto">
          {steps.map((step, idx) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* STEP 1: Basic Information */}
        {activeStep === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পরীক্ষার নাম / শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: নার্সিং ভর্তি পূর্ণাঙ্গ মডেল টেস্ট - ০৪"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  লিংক স্লাগ (URL Slug)
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                  <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-xs font-mono border-r border-slate-200 select-none">
                    /exam/
                  </span>
                  <input
                    type="text"
                    placeholder="nursing-model-test-04"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-'))}
                    className="w-full px-3 py-2 text-sm font-mono text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সংক্ষিপ্ত বিবরণ (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="পরীক্ষার বিষয়বস্তু ও বিশেষ নির্দেশনা..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পরীক্ষার তারিখ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সময়সীমা (মিনিট) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোট প্রশ্ন সংখ্যা <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রতি প্রশ্নে নম্বর
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নেগেটিভ মার্কিং (ভুল উত্তরের জন্য কর্তন)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  placeholder="0.25"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পাস মার্কস শতকরা (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-num bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  স্ট্যাটাস
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="published">লাইভ / প্রকাশিত (Published)</option>
                  <option value="draft">ড্রাফট / খসড়া (Draft)</option>
                  <option value="closed">বন্ধ / সমাপ্ত (Closed)</option>
                </select>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leaderboardEnabled}
                  onChange={(e) => setLeaderboardEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">লিডারবোর্ড সক্রিয় রাখুন</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">প্রশ্ন এলোমেলো (Shuffle)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomizeOptions}
                  onChange={(e) => setRandomizeOptions(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800">বিকল্প এলোমেলো (Shuffle)</span>
              </label>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!title.trim()) {
                    addToast('পরীক্ষার নাম দেওয়া আবশ্যক।', 'warning');
                    return;
                  }
                  setActiveStep('distribution');
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>পরবর্তী: সিলেকশন পদ্ধতি</span>
                <FiArrowRight className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Selection Mode & Subject Distribution */}
        {activeStep === 'distribution' && (
          <div className="space-y-6">
            {/* Selection Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Auto */}
              <div
                onClick={() => setSelectionMode('auto')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                  selectionMode === 'auto'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <FiCpu className="text-lg" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">স্বয়ংক্রিয় সিলেকশন</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  সিস্টেম শুধু সম্পূর্ণ অপ্রচলিত (Unused) প্রশ্ন নির্বাচন করবে। অতীতের কোনো প্রশ্ন আসবে না।
                </p>
                {selectionMode === 'auto' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    <FiCheck className="stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Custom */}
              <div
                onClick={() => setSelectionMode('custom')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                  selectionMode === 'custom'
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <FiEdit3 className="text-lg" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">কাস্টম সিলেকশন</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  অ্যাডমিন নিজে প্রশ্ন ব্যাংক থেকে বেছে নেবেন। প্রয়োজনে পূর্বে ব্যবহৃত প্রশ্নও যুক্ত করা যাবে।
                </p>
                {selectionMode === 'custom' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                    <FiCheck className="stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Hybrid */}
              <div
                onClick={() => setSelectionMode('hybrid')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                  selectionMode === 'hybrid'
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FiLayers className="text-lg" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900">স্মার্ট হাইব্রিড</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  কিছু প্রশ্ন নিজে পছন্দ করবেন, আর বাকি প্রশ্নগুলো সিস্টেম স্বয়ংক্রিয়ভাবে নতুন প্রশ্ন দিয়ে পূরণ করবে।
                </p>
                {selectionMode === 'hybrid' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                    <FiCheck className="stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            {/* Subject Distribution Table */}
            {selectionMode !== 'custom' && (
              <SubjectDistributionTable
                availabilitySummary={availabilitySummary}
                distribution={distribution}
                onChangeDistribution={setDistribution}
                totalQuestions={Number(totalQuestions)}
                selectionMode={selectionMode}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep('basic')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <FiArrowLeft className="text-sm" />
                <span>মৌলিক তথ্য</span>
              </button>

              {selectionMode === 'auto' ? (
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  disabled={loadingPreview}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span>{loadingPreview ? 'নির্বাচন হচ্ছে...' : 'স্বয়ংক্রিয় সিলেকশন ও প্রিভিউ'}</span>
                  <FiArrowRight className="text-sm" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveStep('custom_pick')}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>পরবর্তী: প্রশ্ন বাছাই করুন</span>
                  <FiArrowRight className="text-sm" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Custom Question Picker (for Custom or Hybrid) */}
        {activeStep === 'custom_pick' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-900">
              {selectionMode === 'hybrid' ? (
                <span>
                  <strong>হাইব্রিড মোড:</strong> আপনি যে প্রশ্নগুলো নিশ্চিত রাখতে চান সেগুলো নির্বাচন করুন। বাকি প্রশ্নগুলো আপনার বিষয়ভিত্তিক কোটা অনুযায়ী সিস্টেম স্বয়ংক্রিয়ভাবে নতুন পুল থেকে যোগ করবে।
                </span>
              ) : (
                <span>
                  <strong>কাস্টম মোড:</strong> প্রশ্ন ব্যাংক থেকে আপনার পছন্দ অনুযায়ী প্রশ্ন নির্বাচন করুন। পূর্বে ব্যবহৃত কোনো প্রশ্ন যোগ করতে চাইলে সতর্কবার্তা নিশ্চিত করুন।
                </span>
              )}
            </div>

            <CustomQuestionPicker
              questions={allBankQuestions}
              selectedQuestionIds={manualQuestionIds}
              onToggleQuestion={handleToggleManualQuestion}
              maxQuestions={selectionMode === 'custom' ? Number(totalQuestions) : null}
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep('distribution')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <FiArrowLeft className="text-sm" />
                <span>সিলেকশন ও বণ্টন</span>
              </button>

              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={loadingPreview}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <span>{loadingPreview ? 'প্রিভিউ প্রস্তুত হচ্ছে...' : 'প্রিভিউ ও রিভিউ দেখুন'}</span>
                <FiArrowRight className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Selection Preview & Final Confirmation */}
        {activeStep === 'preview' && (
          <div className="space-y-4">
            <SelectionPreviewList
              questions={previewQuestions}
              marksPerQuestion={marksPerQuestion}
              negativeMarks={negativeMarks}
              onRegenerateSubject={selectionMode !== 'custom' ? handleRegenerateSubject : null}
              onRegenerateAll={selectionMode !== 'custom' ? handleRegenerateAll : null}
              onRemoveQuestion={handleRemoveFromPreview}
              isRegenerating={isRegenerating}
              canRegenerate={selectionMode !== 'custom'}
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveStep(selectionMode === 'auto' ? 'distribution' : 'custom_pick')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <FiArrowLeft className="text-sm" />
                <span>পূর্ববর্তী ধাপে যান</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                <FiSave className="text-sm" />
                <span>{submitting ? 'সংরক্ষণ হচ্ছে...' : editExam ? 'আপডেট সংরক্ষণ করুন' : 'মডেল টেস্ট ফাইনাল করুন'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
