import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import StickyExamHeader from '../../components/exam/StickyExamHeader.jsx';
import QuestionCard from '../../components/exam/QuestionCard.jsx';
import QuestionNavigator from '../../components/exam/QuestionNavigator.jsx';
import SubmitConfirmModal from '../../components/exam/SubmitConfirmModal.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import { FiAlertTriangle, FiShield } from 'react-icons/fi';

export default function ExamPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [studentSession, setStudentSession] = useState(null);

  const timerRef = useRef(null);
  const hasAutoSubmitted = useRef(false);

  // Load student session and exam data
  useEffect(() => {
    const sessionKey = `exam_session_${slug}`;
    const savedSession = localStorage.getItem(sessionKey);

    if (!savedSession) {
      addToast('পরীক্ষা শুরু করার আগে আপনার তথ্য প্রদান করুন।', 'warning');
      navigate(`/exam/${slug}`);
      return;
    }

    const sessionObj = JSON.parse(savedSession);
    setStudentSession(sessionObj);

    const loadExam = async () => {
      try {
        const res = await api.get(`/exams/public/${slug}`);
        if (res.data?.data) {
          const examData = res.data.data;
          setExam(examData);
          setQuestions(examData.questions || []);

          // Calculate remaining timer from session startedAt
          const startTime = new Date(sessionObj.startedAt).getTime();
          const totalDurationSec = (examData.duration || 20) * 60;
          const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
          const remainingSec = Math.max(0, totalDurationSec - elapsedSec);

          setTimeLeft(remainingSec);

          // Restore previously selected answers from localStorage if refreshed
          const answersKey = `exam_answers_${slug}`;
          const savedAnswers = localStorage.getItem(answersKey);
          if (savedAnswers) {
            try {
              setAnswers(JSON.parse(savedAnswers));
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (err) {
        addToast(err.response?.data?.message || 'পরীক্ষা লোড ব্যর্থ হয়েছে।', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [slug, navigate, addToast]);

  // Anti-Cheating: Detect tab switching or visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          addToast(`সতর্কতা! পরীক্ষা চলাকালীন ট্যাব পরিবর্তন লক্ষ্য করা গেছে (${nextCount} বার)।`, 'warning', 6000);
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [addToast]);

  // Save answers to localStorage on change
  const handleSelectOption = (questionId, optionId) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: optionId };
      localStorage.setItem(`exam_answers_${slug}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearOption = (questionId) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      localStorage.setItem(`exam_answers_${slug}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Submit Handler
  const handleSubmitExam = useCallback(async (isAutoSubmit = false) => {
    if (submitting || hasAutoSubmitted.current) return;
    setSubmitting(true);
    hasAutoSubmitted.current = true;

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        questionId: qId,
        selectedOption: opt,
      }));

      const payload = {
        examSlug: slug,
        studentName: studentSession.studentName,
        whatsappNumber: studentSession.whatsappNumber,
        address: studentSession.address,
        studentId: studentSession.studentId || null,
        firebaseUid: studentSession.firebaseUid || null,
        answers: formattedAnswers,
        startedAt: studentSession.startedAt,
        tabSwitchCount,
      };

      const res = await api.post('/submissions', payload);

      if (res.data?.success) {
        // Clear local exam session
        localStorage.removeItem(`exam_session_${slug}`);
        localStorage.removeItem(`exam_answers_${slug}`);

        addToast(isAutoSubmit ? 'সময় শেষ! আপনার পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়েছে।' : 'পরীক্ষা সফলভাবে জমা হয়েছে!', 'success');
        navigate(`/result/${res.data.data.submissionId}`);
      }
    } catch (err) {
      hasAutoSubmitted.current = false;
      setSubmitting(false);
      setShowConfirmModal(false);

      if (err.response?.status === 409 && err.response?.data?.existingSubmissionId) {
        addToast(err.response.data.message, 'warning');
        navigate(`/result/${err.response.data.existingSubmissionId}`);
      } else {
        addToast(err.response?.data?.message || 'পরীক্ষা জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
      }
    }
  }, [submitting, answers, slug, studentSession, tabSwitchCount, navigate, addToast]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitExam(true); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeLeft, handleSubmitExam]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const scrollToQuestion = (questionId) => {
    const el = document.getElementById(`question-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return <LoadingState message="পরীক্ষার প্রশ্নপত্র প্রস্তুত হচ্ছে..." />;
  }

  const answeredCount = Object.keys(answers).filter(qId => !!answers[qId]).length;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      
      {/* Sticky Header */}
      <StickyExamHeader
        title={exam?.title || 'অনলাইন মডেল টেস্ট'}
        timeLeftSeconds={timeLeft}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        onSubmitClick={() => setShowConfirmModal(true)}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />

      {/* Tab Switch Warning Banner if student left the tab */}
      {tabSwitchCount > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-3">
          <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-lg text-amber-600 shrink-0" />
              <span>
                সতর্কতা: আপনি পরীক্ষা চলাকালীন <strong>{tabSwitchCount} বার</strong> ট্যাব পরিবর্তন করেছেন। এটি সার্ভারে রেকর্ড করা হচ্ছে।
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Exam Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Questions Column (3 cols on desktop) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Student Info Chip */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-600 gap-2">
              <div>
                <span>পরীক্ষার্থী: </span>
                <strong className="text-slate-900">{studentSession?.studentName}</strong>
              </div>
              <div className="font-num text-slate-500">
                <span>WhatsApp: </span>
                <span className="font-semibold text-slate-800">{studentSession?.whatsappNumber}</span>
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <FiAlertTriangle className="text-2xl" />
                </div>
                <h3 className="text-base font-bold text-slate-800">কোনো প্রশ্ন পাওয়া যায়নি</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  এই পরীক্ষায় বর্তমানে কোনো প্রশ্ন প্রকাশিত হয়নি।
                </p>
              </div>
            ) : (
              questions.map((question, idx) => {
                const qKey = question._id || question.id || `q_${idx}`;
                return (
                  <QuestionCard
                    key={qKey}
                    question={question}
                    questionIndex={idx}
                    selectedOption={answers[question._id || question.id]}
                    onSelectOption={handleSelectOption}
                    onClearOption={handleClearOption}
                  />
                );
              })
            )}

            {/* Bottom Submit Action */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center space-y-3 mt-8">
              <h3 className="text-base font-bold text-slate-900">
                সবগুলো প্রশ্নের উত্তর নিশ্চিত করেছেন?
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                আপনি {answeredCount}টি প্রশ্নের উত্তর নির্বাচন করেছেন। বাকি {totalQuestions - answeredCount}টি প্রশ্ন এখনো খালি রয়েছে।
              </p>
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-[#1c398e] hover:bg-[#152e75] active:bg-[#0f246e] text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                পরীক্ষা জমা দিন (Submit Exam)
              </button>
            </div>

          </div>

          {/* Right Sidebar: Sticky Question Navigator (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24 space-y-4">
            <QuestionNavigator
              questions={questions}
              answers={answers}
              onSelectQuestion={scrollToQuestion}
            />

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1.5">
              <p className="font-bold">গুরুত্বপূর্ণ পরামর্শ:</p>
              <p className="text-slate-600">
                নির্দিষ্ট প্রশ্ন নম্বরে ক্লিক করে সরাসরি সেই প্রশ্নে যেতে পারবেন। সময় শেষ হলে খাতা স্বয়ংক্রিয়ভাবে জমা হবে।
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => handleSubmitExam(false)}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        submitting={submitting}
      />

    </div>
  );
}
