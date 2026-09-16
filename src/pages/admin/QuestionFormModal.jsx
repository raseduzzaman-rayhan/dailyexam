import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal.jsx';
import api from '../../api/client.js';
import { useToast } from '../../components/common/Toast.jsx';

const COMMON_SUBJECTS = [
  'বাংলা',
  'ইংরেজি',
  'গণিত',
  'বাংলাদেশ বিষয়াবলী',
  'আন্তর্জাতিক বিষয়াবলী',
  'সাধারণ বিজ্ঞান',
  'ভূগোল ও পরিবেশ',
  'কম্পিউটার ও তথ্যপ্রযুক্তি',
  'নৈতিকতা ও সুশাসন',
  'সাধারণ জ্ঞান',
];

export default function QuestionFormModal({ isOpen, onClose, onSaved, editQuestion = null }) {
  const { addToast } = useToast();

  const [subject, setSubject] = useState('বাংলাদেশ বিষয়াবলী');
  const [category, setCategory] = useState('সাধারণ');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editQuestion) {
        setSubject(editQuestion.subject || 'বাংলাদেশ বিষয়াবলী');
        setCategory(editQuestion.category || 'সাধারণ');
        setQuestionText(editQuestion.questionText || '');
        setOptions(editQuestion.options || [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ]);
        setCorrectAnswer(editQuestion.correctAnswer || 'A');
        setExplanation(editQuestion.explanation || '');
        setMarks(editQuestion.marks || 1);
        setDifficulty(editQuestion.difficulty || 'medium');
      } else {
        setSubject('বাংলাদেশ বিষয়াবলী');
        setCategory('সাধারণ');
        setQuestionText('');
        setOptions([
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ]);
        setCorrectAnswer('A');
        setExplanation('');
        setMarks(1);
        setDifficulty('medium');
      }
    }
  }, [isOpen, editQuestion]);

  const handleOptionChange = (id, val) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, text: val } : opt));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionText.trim()) {
      addToast('প্রশ্নের বিবরণ লিখুন।', 'warning');
      return;
    }

    const hasEmptyOption = options.some(opt => !opt.text.trim());
    if (hasEmptyOption) {
      addToast('অনুগ্রহ করে ৪টি বিকল্পেরই টেক্সট পূরণ করুন।', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject: subject.trim(),
        category: category.trim(),
        questionText: questionText.trim(),
        options,
        correctAnswer,
        explanation: explanation.trim(),
        marks: Number(marks) || 1,
        difficulty,
      };

      if (editQuestion) {
        await api.put(`/questions/${editQuestion._id}`, payload);
        addToast('প্রশ্নটি সফলভাবে আপডেট করা হয়েছে।', 'success');
      } else {
        await api.post('/questions', payload);
        addToast('প্রশ্নটি প্রশ্ন ব্যাংকে সফলভাবে যোগ করা হয়েছে।', 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editQuestion ? 'প্রশ্ন সম্পাদনা করুন' : 'প্রশ্ন ব্যাংকে নতুন প্রশ্ন যোগ করুন'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Subject & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              বিষয় <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="subjectsList"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="বিষয় নির্বাচন বা লিখুন"
            />
            <datalist id="subjectsList">
              {COMMON_SUBJECTS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ক্যাটাগরি / টপিক
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="যেমন: সংবিধান, ব্যাকরণ..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              কাঠিন্যের স্তর (Difficulty)
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">সহজ (Easy)</option>
              <option value="medium">মাঝারি (Medium)</option>
              <option value="hard">কঠিন (Hard)</option>
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            প্রশ্নের বিবরণ (Question Text) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="3"
            required
            placeholder="প্রশ্নের সম্পূর্ণ বিবরণ লিখুন..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-base font-kalpurush focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 4 Options & Correct Answer Radio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700">
              বিকল্পসমূহ (Options) ও সঠিক উত্তর নির্বাচন <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-blue-700 font-semibold">
              সঠিক উত্তরের পাশের রেডিও বাটনে ক্লিক করুন
            </span>
          </div>

          <div className="space-y-2">
            {options.map((opt) => {
              const isCorrect = correctAnswer === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition ${
                    isCorrect ? 'bg-blue-50/70 border-blue-400' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <label className="flex items-center gap-1.5 cursor-pointer pl-1">
                    <input
                      type="radio"
                      name="correctAnswerOption"
                      checked={isCorrect}
                      onChange={() => setCorrectAnswer(opt.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-num font-bold text-xs w-5 text-center">
                      {opt.id}
                    </span>
                  </label>

                  <input
                    type="text"
                    required
                    placeholder={`বিকল্প ${opt.id} এর উত্তর...`}
                    value={opt.text}
                    onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm font-kalpurush focus:ring-1 focus:ring-blue-500"
                  />

                  {isCorrect && (
                    <span className="text-[11px] font-bold text-blue-700 pr-2 shrink-0">
                      ✓ সঠিক
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            সমাধান ও বিস্তারিত ব্যাখ্যা (Explanation)
          </label>
          <textarea
            rows="3"
            placeholder="পরীক্ষার্থী যেন পরীক্ষার পর এই ব্যাখ্যা থেকে সমাধান বিস্তারিত জানতে পারে..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm font-kalpurush focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm font-bold text-white bg-[#1c398e] hover:bg-[#152e75] rounded-xl shadow-xs transition cursor-pointer"
          >
            {submitting ? 'সংরক্ষণ হচ্ছে...' : (editQuestion ? 'আপডেট করুন' : 'প্রশ্ন যোগ করুন')}
          </button>
        </div>

      </form>
    </Modal>
  );
}
