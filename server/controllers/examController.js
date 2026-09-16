import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import {
  autoSelectQuestionsForSubjects,
  regenerateQuestionsSelection,
  validateQuestionsForExamSave,
  recordExamQuestionUsage,
  removeExamQuestionUsage,
  updateExamQuestionUsageStatus
} from '../services/questionSelectionService.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0980-\u09FF-]+/g, '')
    .replace(/--+/g, '-');
}

export const getAllExamsAdmin = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'পরীক্ষাগুলোর তালিকা আনতে সমস্যা হয়েছে।'
    });
  }
};

export const getPublicExams = async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'published' })
      .select('-__v')
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'পাবলিক পরীক্ষা আনতে সমস্যা হয়েছে।'
    });
  }
};

export const getPublicExamBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const exam = await Exam.findOne({
      $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }]
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    if (exam.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'এই পরীক্ষাটি বর্তমানে জনসাধারণের জন্য উন্মুক্ত নয়।'
      });
    }

    // Resolve questions from MongoDB with deterministic ordering
    let populatedQuestions = [];
    if (exam.questions && exam.questions.length > 0) {
      const questionIds = exam.questions.map((q) => String(q._id ? q._id : q));
      const rawQuestions = await Question.find({ _id: { $in: questionIds } });
      const qMap = new Map();
      rawQuestions.forEach((q) => qMap.set(String(q._id), q));
      populatedQuestions = questionIds.map((id) => qMap.get(id)).filter(Boolean);
    }

    // Security: Hide answers and explanations during the active test
    const sanitizedQuestions = populatedQuestions.map((q) => {
      const qObj = q.toObject ? q.toObject() : { ...q };
      delete qObj.correctAnswer;
      delete qObj.answer;
      delete qObj.explanation;
      return qObj;
    });

    if (exam.randomizeQuestions) {
      sanitizedQuestions.sort(() => Math.random() - 0.5);
    }

    const examData = exam.toObject ? exam.toObject() : { ...exam };
    examData.questions = sanitizedQuestions;

    return res.status(200).json({
      success: true,
      data: examData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'পরীক্ষা লোড করতে সমস্যা হয়েছে।'
    });
  }
};

export const getExamByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    let populatedQuestions = [];
    if (exam.questions && exam.questions.length > 0) {
      const questionIds = exam.questions.map((q) => String(q._id ? q._id : q));
      const rawQuestions = await Question.find({ _id: { $in: questionIds } });
      const qMap = new Map();
      rawQuestions.forEach((q) => qMap.set(String(q._id), q));
      populatedQuestions = questionIds.map((id) => qMap.get(id)).filter(Boolean);
    }

    const examData = exam.toObject ? exam.toObject() : { ...exam };
    examData.questions = populatedQuestions;

    return res.status(200).json({
      success: true,
      data: examData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'পরীক্ষার তথ্য লোড করা যায়নি।'
    });
  }
};

export const previewQuestionSelection = async (req, res) => {
  try {
    const { selectionMode = 'auto', totalQuestions, distribution = {}, manualQuestionIds = [], excludeExamId } = req.body;

    const numTotal = Number(totalQuestions) || 0;
    const distSum = Object.values(distribution).reduce((sum, val) => sum + (Number(val) || 0), 0);

    if (numTotal > 0 && distSum !== numTotal) {
      return res.status(400).json({
        success: false,
        message: `বিষয়ভিত্তিক প্রশ্নের যোগফল (${distSum}) অবশ্যই নির্ধারিত মোট প্রশ্নের সংখ্যার (${numTotal}) সমান হতে হবে।`
      });
    }

    if (selectionMode === 'custom') {
      const cleanIds = Array.isArray(manualQuestionIds) ? manualQuestionIds.map(String) : [];
      const questions = await Question.find({ _id: { $in: cleanIds } }).lean();
      return res.status(200).json({
        success: true,
        data: {
          questions,
          totalSelected: questions.length
        }
      });
    }

    const result = await autoSelectQuestionsForSubjects({
      distribution,
      manualSelectedIds: manualQuestionIds,
      excludeExamId
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'প্রশ্ন নির্বাচন ব্যর্থ হয়েছে।'
    });
  }
};

export const regenerateSelection = async (req, res) => {
  try {
    const {
      distribution = {},
      manualQuestionIds = [],
      currentQuestionIds = [],
      targetSubject = null,
      excludeExamId
    } = req.body;

    const result = await regenerateQuestionsSelection({
      distribution,
      manualSelectedIds: manualQuestionIds,
      currentSelectedIds: currentQuestionIds,
      targetSubject,
      excludeExamId
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'প্রশ্ন পুনরায় নির্বাচন ব্যর্থ হয়েছে।'
    });
  }
};

export const validateSelectionEndpoint = async (req, res) => {
  try {
    const { questionIds = [], selectionMode = 'auto', manualQuestionIds = [], excludeExamId } = req.body;

    await validateQuestionsForExamSave({
      questionIds,
      selectionMode,
      manualSelectedIds: manualQuestionIds,
      excludeExamId
    });

    return res.status(200).json({
      success: true,
      message: 'সকল প্রশ্ন পরীক্ষা তৈরির জন্য উপযুক্ত ও বৈধ।'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'প্রশ্ন যাচাইকরণ ব্যর্থ হয়েছে।'
    });
  }
};

export const createExam = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      date,
      startTime,
      endTime,
      duration,
      questions,
      totalMarks,
      passingPercentage,
      status,
      leaderboardEnabled,
      randomizeQuestions,
      randomizeOptions,
      selectionMode,
      subjectDistribution,
      manualQuestionIds,
      marksPerQuestion,
      negativeMarks
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'পরীক্ষার শিরোনাম ও তারিখ প্রদান করা আবশ্যক।'
      });
    }

    const cleanQuestionIds = Array.isArray(questions)
      ? questions.map((q) => (typeof q === 'object' && q?._id ? String(q._id) : String(q))).filter(Boolean)
      : [];

    if (cleanQuestionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'পরীক্ষায় অন্তত একটি প্রশ্ন নির্বাচন করতে হবে।'
      });
    }

    // Concurrency & Validity Check
    await validateQuestionsForExamSave({
      questionIds: cleanQuestionIds,
      selectionMode: selectionMode || 'custom',
      manualSelectedIds: manualQuestionIds || [],
      excludeExamId: null
    });

    const examDate = new Date(date).toISOString().slice(0, 10).replace(/-/g, '');
    const generatedSlug = (slug || `${slugify(title)}-${examDate}`).toLowerCase();

    const existingExam = await Exam.findOne({ slug: generatedSlug });
    const finalSlug = existingExam ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : generatedSlug;

    const calculatedMarks =
      totalMarks !== undefined
        ? Number(totalMarks)
        : cleanQuestionIds.length * (Number(marksPerQuestion) || 1);

    const newExam = await Exam.create({
      title,
      slug: finalSlug,
      description: description || '',
      date,
      startTime: startTime || '00:00',
      endTime: endTime || '23:59',
      duration: duration || 20,
      questions: cleanQuestionIds,
      selectionMode: selectionMode || 'custom',
      subjectDistribution: subjectDistribution || {},
      manualQuestionIds: Array.isArray(manualQuestionIds) ? manualQuestionIds : [],
      marksPerQuestion: Number(marksPerQuestion) || 1,
      negativeMarks: Number(negativeMarks) || 0,
      totalMarks: calculatedMarks,
      passingPercentage: passingPercentage || 50,
      status: status || 'draft',
      leaderboardEnabled: leaderboardEnabled !== false,
      randomizeQuestions: !!randomizeQuestions,
      randomizeOptions: !!randomizeOptions,
      createdBy: req.admin ? req.admin.name : 'Admin'
    });

    // Record question usage in DB
    await recordExamQuestionUsage({
      examId: newExam._id,
      examTitle: newExam.title,
      examStatus: newExam.status,
      examDate: newExam.date,
      questionIds: cleanQuestionIds
    });

    return res.status(201).json({
      success: true,
      message: 'পরীক্ষা সফলভাবে তৈরি হয়েছে।',
      data: newExam
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'পরীক্ষা তৈরি ব্যর্থ হয়েছে।'
    });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    const updateData = { ...req.body };

    if (updateData.questions && Array.isArray(updateData.questions)) {
      const cleanQuestionIds = updateData.questions
        .map((q) => (typeof q === 'object' && q?._id ? String(q._id) : String(q)))
        .filter(Boolean);

      await validateQuestionsForExamSave({
        questionIds: cleanQuestionIds,
        selectionMode: updateData.selectionMode || exam.selectionMode || 'custom',
        manualSelectedIds: updateData.manualQuestionIds || exam.manualQuestionIds || [],
        excludeExamId: id
      });

      updateData.questions = cleanQuestionIds;
    }

    const updated = await Exam.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    // Sync question usage
    if (updated.questions) {
      await recordExamQuestionUsage({
        examId: updated._id,
        examTitle: updated.title,
        examStatus: updated.status,
        examDate: updated.date,
        questionIds: updated.questions
      });
    }

    return res.status(200).json({
      success: true,
      message: 'পরীক্ষা সফলভাবে আপডেট করা হয়েছে।',
      data: updated
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'পরীক্ষা আপডেট ব্যর্থ হয়েছে।'
    });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    await Exam.findByIdAndDelete(id);
    await removeExamQuestionUsage(id);

    return res.status(200).json({
      success: true,
      message: 'পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে।'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'পরীক্ষা মুছতে সমস্যা হয়েছে।'
    });
  }
};

export const publishExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    const nextStatus = exam.status === 'published' ? 'draft' : 'published';

    // If publishing, perform final conflict check
    if (nextStatus === 'published' && exam.questions && exam.questions.length > 0) {
      const cleanIds = exam.questions.map((q) => String(q._id ? q._id : q));
      await validateQuestionsForExamSave({
        questionIds: cleanIds,
        selectionMode: exam.selectionMode || 'custom',
        manualSelectedIds: exam.manualQuestionIds || [],
        excludeExamId: id
      });
    }

    exam.status = nextStatus;
    await exam.save();

    await updateExamQuestionUsageStatus(id, nextStatus);

    return res.status(200).json({
      success: true,
      message: nextStatus === 'published' ? 'পরীক্ষাটি সফলভাবে প্রকাশ করা হয়েছে।' : 'পরীক্ষাটি ড্রাফট মোডে নেওয়া হয়েছে।',
      exam,
      data: exam
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'পরীক্ষা প্রকাশে সমস্যা হয়েছে।'
    });
  }
};

export const duplicateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'মূল পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    const examObj = exam.toObject();
    delete examObj._id;
    delete examObj.createdAt;
    delete examObj.updatedAt;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    examObj.title = `${exam.title} (অনুলিপি)`;
    examObj.slug = `${exam.slug}-copy-${randomSuffix}`.toLowerCase();
    examObj.status = 'draft';
    examObj.createdBy = req.admin ? req.admin.name : (exam.createdBy || 'Admin');

    const duplicatedExam = await Exam.create(examObj);

    return res.status(201).json({
      success: true,
      message: 'পরীক্ষার অনুলিপি সফলভাবে তৈরি হয়েছে।',
      data: duplicatedExam,
      exam: duplicatedExam
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'অনুলিপি তৈরিতে সমস্যা হয়েছে।'
    });
  }
};

export const getExamLeaderboard = async (req, res) => {
  try {
    const { slug } = req.params;

    const exam = await Exam.findOne({
      $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }]
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।'
      });
    }

    const submissions = await Submission.find({
      $or: [{ examId: exam._id }, { examSlug: exam.slug }]
    })
      .sort({ score: -1, durationSeconds: 1, submittedAt: 1 })
      .limit(100);

    const leaderboard = submissions.map((sub, index) => ({
      rank: index + 1,
      studentName: sub.studentName,
      whatsappNumber: sub.whatsappNumber ? sub.whatsappNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '',
      address: sub.address || '',
      score: sub.score,
      totalQuestions: sub.totalQuestions,
      correctCount: sub.correctCount,
      wrongCount: sub.wrongCount,
      percentage: sub.percentage,
      durationSeconds: sub.durationSeconds || 0,
      submittedAt: sub.submittedAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        examTitle: exam.title,
        examSlug: exam.slug,
        totalMarks: exam.totalMarks,
        leaderboard
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'লিডারবোর্ড লোড করা যায়নি।'
    });
  }
};

export default {
  getAllExamsAdmin,
  getPublicExams,
  getPublicExamBySlug,
  getExamByIdAdmin,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  duplicateExam,
  getExamLeaderboard
};
