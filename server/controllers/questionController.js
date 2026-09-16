import Question from '../models/Question.js';
import {
  getAvailableQuestionCountsBySubject,
  getQuestionUsageMap,
  getRunningOrUpcomingQuestionIds
} from '../services/questionSelectionService.js';

export const getAllQuestions = async (req, res) => {
  try {
    const { subject, category, search, difficulty, includeUsage, excludeExamId } = req.query;

    const filter = {};
    if (subject) filter.subject = subject;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { question: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 }).lean();

    // Attach usage metadata
    let enrichedQuestions = questions;
    const [usageMap, runningIds] = await Promise.all([
      getQuestionUsageMap(excludeExamId),
      getRunningOrUpcomingQuestionIds(excludeExamId)
    ]);

    enrichedQuestions = questions.map((q) => {
      const qId = String(q._id);
      const usageInfo = usageMap.get(qId);
      const isRunning = runningIds.has(qId);
      const usageCount = usageInfo ? usageInfo.count : 0;
      const lastExam = usageInfo && usageInfo.exams && usageInfo.exams.length > 0
        ? usageInfo.exams[usageInfo.exams.length - 1]
        : null;

      return {
        ...q,
        isUsed: usageCount > 0,
        usageCount,
        isRunning,
        lastUsedExamTitle: lastExam ? lastExam.title : null,
        lastUsedExamDate: lastExam ? lastExam.date : null,
        usedInExams: usageInfo ? usageInfo.exams : []
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedQuestions.length,
      data: enrichedQuestions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রশ্নগুলোর তালিকা আনতে সমস্যা হয়েছে।'
    });
  }
};

export const getAvailabilitySummary = async (req, res) => {
  try {
    const { excludeExamId } = req.query;
    const summary = await getAvailableQuestionCountsBySubject(excludeExamId);
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'বিষয়ভিত্তিক প্রাপ্যতা তথ্য লোড করতে সমস্যা হয়েছে।'
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'প্রশ্নটি খুঁজে পাওয়া যায়নি।'
      });
    }

    return res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রশ্নের তথ্য লোড করতে সমস্যা হয়েছে।'
    });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const {
      subject,
      category,
      topic,
      questionText,
      question,
      options,
      correctAnswer,
      answer,
      explanation,
      marks,
      difficulty
    } = req.body;

    const text = questionText || question;
    if (!text || !subject) {
      return res.status(400).json({
        success: false,
        message: 'বিষয় ও প্রশ্নের বিবরণ প্রদান করা আবশ্যক।'
      });
    }

    const finalAnswer = correctAnswer || (typeof answer === 'string' ? answer : '');

    const newQuestion = await Question.create({
      subject,
      category: category || 'সাধারণ',
      topic: topic || '',
      questionText: text,
      question: text,
      options: options || [],
      correctAnswer: finalAnswer,
      answer: finalAnswer,
      explanation: explanation || '',
      marks: marks || 1,
      difficulty: difficulty || 'medium'
    });

    return res.status(201).json({
      success: true,
      message: 'প্রশ্ন সফলভাবে তৈরি করা হয়েছে।',
      data: newQuestion
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রশ্ন তৈরি ব্যর্থ হয়েছে।'
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'প্রশ্নটি খুঁজে পাওয়া যায়নি।'
      });
    }

    const updateData = { ...req.body };
    if (updateData.questionText && !updateData.question) {
      updateData.question = updateData.questionText;
    }
    if (updateData.correctAnswer && !updateData.answer) {
      updateData.answer = updateData.correctAnswer;
    }

    const updated = await Question.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    return res.status(200).json({
      success: true,
      message: 'প্রশ্ন সফলভাবে আপডেট করা হয়েছে।',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রশ্ন আপডেট ব্যর্থ হয়েছে।'
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'প্রশ্নটি খুঁজে পাওয়া যায়নি।'
      });
    }

    await Question.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে।'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রশ্ন মুছতে সমস্যা হয়েছে।'
    });
  }
};

export const getSubjectsAndCategories = async (req, res) => {
  try {
    const subjects = await Question.distinct('subject');
    const categories = await Question.distinct('category');

    return res.status(200).json({
      success: true,
      data: {
        subjects: subjects.filter(Boolean),
        categories: categories.filter(Boolean)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const duplicateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'প্রশ্নটি খুঁজে পাওয়া যায়নি।'
      });
    }

    const questionObj = question.toObject();
    delete questionObj._id;
    delete questionObj.createdAt;
    delete questionObj.updatedAt;

    questionObj.questionText = `${question.questionText} (অনুলিপি)`;

    const duplicated = await Question.create(questionObj);

    return res.status(201).json({
      success: true,
      message: 'প্রশ্নের অনুলিপি সফলভাবে তৈরি হয়েছে।',
      data: duplicated,
      question: duplicated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রশ্নের অনুলিপি তৈরি ব্যর্থ হয়েছে।'
    });
  }
};

export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  getSubjectsAndCategories
};
