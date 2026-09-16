import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';
import { verifyFirebaseOrAppToken } from '../config/firebaseAdmin.js';

export const submitExam = async (req, res) => {
  try {
    const {
      examSlug,
      examId,
      studentName,
      whatsappNumber,
      address,
      answers,
      startedAt,
      tabSwitchCount = 0
    } = req.body;

    if (!studentName || !whatsappNumber || !address) {
      return res.status(400).json({
        success: false,
        message: 'নাম, WhatsApp নম্বর এবং ঠিকানা প্রদান করা আবশ্যক।'
      });
    }

    const cleanWhatsapp = whatsappNumber.trim();
    const cleanName = studentName.trim();
    const cleanAddress = address.trim();

    // Find the exam in MongoDB
    const exam = await Exam.findOne({
      $or: [
        ...(examSlug ? [{ slug: examSlug }] : []),
        ...(examId && examId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: examId }] : [])
      ]
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    // Check duplicate submission
    const existingSubmission = await Submission.findOne({
      examId: exam._id,
      whatsappNumber: cleanWhatsapp
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'আপনি ইতিমধ্যে এই পরীক্ষায় অংশগ্রহণ করেছেন।',
        submissionId: existingSubmission._id
      });
    }

    // Fetch questions from MongoDB to grade
    let questions = [];
    if (exam.questions && exam.questions.length > 0) {
      const qIds = exam.questions.map((q) => (q._id ? q._id : q));
      questions = await Question.find({ _id: { $in: qIds } });
    }

    // Normalize student's answers (array or map)
    const answersMap = {};
    if (Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (ans && ans.questionId) {
          answersMap[String(ans.questionId)] = ans.selectedOption || '';
        }
      });
    } else if (answers && typeof answers === 'object') {
      Object.entries(answers).forEach(([qId, opt]) => {
        answersMap[String(qId)] = String(opt || '');
      });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const gradedAnswers = [];

    questions.forEach((q) => {
      const qIdStr = String(q._id);
      const selected = answersMap[qIdStr] || '';
      const correct = String(q.correctAnswer || q.answer || '').trim();

      if (!selected) {
        unansweredCount++;
        gradedAnswers.push({
          questionId: qIdStr,
          selectedOption: '',
          isCorrect: false
        });
      } else {
        const isCorrect = selected.toUpperCase() === correct.toUpperCase();
        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }
        gradedAnswers.push({
          questionId: qIdStr,
          selectedOption: selected,
          isCorrect
        });
      }
    });

    const totalQuestions = questions.length || exam.totalMarks || 1;
    const marksPerQuestion = totalQuestions > 0 ? (exam.totalMarks || totalQuestions) / totalQuestions : 1;
    const score = Math.max(0, Math.round(correctCount * marksPerQuestion * 100) / 100);
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= (exam.passingPercentage || 50);

    const startTime = startedAt ? new Date(startedAt) : new Date();
    const submitTime = new Date();
    const durationSeconds = Math.max(0, Math.round((submitTime.getTime() - startTime.getTime()) / 1000));

    // Link student if registered
    let student = await Student.findOne({ whatsapp: cleanWhatsapp });

    const newSubmission = await Submission.create({
      examId: exam._id,
      examSlug: exam.slug || examSlug,
      studentId: student ? student._id : null,
      firebaseUid: student ? student.firebaseUid : null,
      studentName: cleanName,
      whatsappNumber: cleanWhatsapp,
      address: cleanAddress,
      answers: gradedAnswers,
      totalQuestions,
      correctCount,
      wrongCount,
      unansweredCount,
      score,
      percentage,
      passed,
      startedAt: startTime,
      submittedAt: submitTime,
      durationSeconds,
      tabSwitchCount: Number(tabSwitchCount) || 0
    });

    return res.status(201).json({
      success: true,
      message: 'উত্তরপত্র সফলভাবে জমা হয়েছে।',
      data: {
        submissionId: newSubmission._id,
        id: newSubmission._id,
        examId: exam._id,
        examTitle: exam.title,
        studentName: cleanName,
        whatsappNumber: cleanWhatsapp,
        address: cleanAddress,
        totalQuestions,
        correctCount,
        wrongCount,
        unansweredCount,
        score,
        totalMarks: exam.totalMarks,
        percentage,
        passed,
        durationSeconds,
        submittedAt: submitTime
      }
    });
  } catch (error) {
    console.error('[Submission Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'উত্তরপত্র জমা নেওয়ার সময় সার্ভারে ত্রুটি হয়েছে।'
    });
  }
};

export const getSubmissionResult = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'my' || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'ফলাফল পাওয়া যায়নি।'
      });
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'ফলাফল পাওয়া যায়নি।'
      });
    }

    const exam = await Exam.findById(submission.examId);

    return res.status(200).json({
      success: true,
      data: {
        submissionId: submission._id,
        id: submission._id,
        examTitle: exam ? exam.title : 'পরীক্ষা',
        examSlug: submission.examSlug,
        studentName: submission.studentName,
        whatsappNumber: submission.whatsappNumber,
        address: submission.address,
        totalQuestions: submission.totalQuestions,
        correctCount: submission.correctCount,
        wrongCount: submission.wrongCount,
        unansweredCount: submission.unansweredCount,
        score: submission.score,
        totalMarks: exam ? exam.totalMarks : submission.totalQuestions,
        percentage: submission.percentage,
        passed: submission.passed,
        durationSeconds: submission.durationSeconds,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'ফলাফল লোড করতে সমস্যা হয়েছে।'
    });
  }
};

export const getSubmissionSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'সাবমিশনটি খুঁজে পাওয়া যায়নি।'
      });
    }

    const exam = await Exam.findById(submission.examId);

    let questions = [];
    if (exam && exam.questions && exam.questions.length > 0) {
      const qIds = exam.questions.map((q) => (q._id ? q._id : q));
      questions = await Question.find({ _id: { $in: qIds } });
    }

    const studentAnswersMap = {};
    if (submission.answers) {
      submission.answers.forEach((ans) => {
        studentAnswersMap[String(ans.questionId)] = ans.selectedOption;
      });
    }

    const solutions = questions.map((q, index) => {
      const qIdStr = String(q._id);
      const studentOption = studentAnswersMap[qIdStr] || '';
      const correctOption = String(q.correctAnswer || q.answer || '').trim();
      const isCorrect = studentOption && studentOption.toUpperCase() === correctOption.toUpperCase();

      let status = 'unanswered';
      if (studentOption) {
        status = isCorrect ? 'correct' : 'wrong';
      }

      return {
        questionId: q._id,
        _id: q._id,
        questionIndex: index + 1,
        questionText: q.questionText || q.question,
        options: q.options,
        correctAnswer: correctOption,
        studentAnswer: studentOption,
        userAnswer: studentOption,
        explanation: q.explanation || '',
        subject: q.subject,
        category: q.category,
        isCorrect,
        status
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        submission: {
          id: submission._id,
          examTitle: exam ? exam.title : 'পরীক্ষা',
          studentName: submission.studentName,
          whatsappNumber: submission.whatsappNumber,
          score: submission.score,
          correctCount: submission.correctCount,
          wrongCount: submission.wrongCount,
          unansweredCount: submission.unansweredCount,
          totalQuestions: submission.totalQuestions,
          totalMarks: exam ? exam.totalMarks : submission.totalQuestions,
          submittedAt: submission.submittedAt
        },
        exam: {
          id: exam ? exam._id : null,
          title: exam ? exam.title : 'পরীক্ষা',
          slug: exam ? exam.slug : submission.examSlug
        },
        solutions,
        questions: solutions
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'সমাধান লোড করতে সমস্যা হয়েছে।'
    });
  }
};

export const getAllSubmissionsAdmin = async (req, res) => {
  try {
    const { examId, search } = req.query;
    const filter = {};
    if (examId) filter.examId = examId;
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { whatsappNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .populate('examId', 'title slug totalMarks');

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'সাবমিশন তালিকা আনতে সমস্যা হয়েছে।'
    });
  }
};

export const getStudentHistory = async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanId = (identifier || '').trim();

    const submissions = await Submission.find({
      $or: [
        { whatsappNumber: cleanId },
        { firebaseUid: cleanId },
        ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ studentId: cleanId }] : [])
      ]
    })
      .sort({ submittedAt: -1 })
      .populate('examId', 'title slug totalMarks duration');

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'ইতিহাস আনতে সমস্যা হয়েছে।'
    });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let decoded = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        decoded = await verifyFirebaseOrAppToken(token);
      } catch (err) {
        // ignore
      }
    }

    if (!decoded) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const cleanEmail = decoded.email ? decoded.email.toLowerCase().trim() : '';
    const firebaseUid = decoded.firebaseUid;

    let student = await Student.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    const orConditions = [];
    if (student) {
      orConditions.push({ studentId: student._id });
      if (student.whatsapp) orConditions.push({ whatsappNumber: student.whatsapp });
      if (student.firebaseUid) orConditions.push({ firebaseUid: student.firebaseUid });
    } else if (firebaseUid) {
      orConditions.push({ firebaseUid });
    }

    if (orConditions.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const submissions = await Submission.find({ $or: orConditions })
      .sort({ submittedAt: -1 })
      .populate('examId', 'title slug totalMarks duration');

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'ইতিহাস লোড করা যায়নি।'
    });
  }
};

export default {
  submitExam,
  getSubmissionResult,
  getSubmissionSolution,
  getAllSubmissionsAdmin,
  getStudentHistory,
  getMySubmissions
};
