import mongoose from 'mongoose';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import QuestionUsage from '../models/QuestionUsage.js';

/**
 * Format today's date as YYYY-MM-DD
 */
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sync question usage from all existing exams in database
 * This ensures legacy exams are fully respected without losing any history
 */
export async function syncQuestionUsageFromExams() {
  try {
    const exams = await Exam.find().select('_id title status date questions');
    for (const exam of exams) {
      if (!exam.questions || exam.questions.length === 0) continue;

      const questionIds = exam.questions
        .map((q) => {
          if (!q) return null;
          if (typeof q === 'string') return q;
          if (typeof q === 'object' && (q._id || q.id)) return String(q._id || q.id);
          return String(q);
        })
        .filter(Boolean);

      const ops = questionIds.map((qId) => ({
        updateOne: {
          filter: { questionId: qId, examId: exam._id },
          update: {
            $set: {
              questionId: qId,
              examId: exam._id,
              examTitle: exam.title || '',
              examStatus: exam.status || 'draft',
              examDate: exam.date || '',
              usedAt: exam.createdAt || new Date()
            }
          },
          upsert: true
        }
      }));

      if (ops.length > 0) {
        await QuestionUsage.bulkWrite(ops, { ordered: false }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[Question Usage Sync Warning]:', err.message);
  }
}

/**
 * Get map of all question usages across published/closed exams
 * Returns Map: questionId => { count, exams: [{ examId, title, status, date }] }
 */
export async function getQuestionUsageMap(excludeExamId = null) {
  const filter = {
    examStatus: { $in: ['published', 'closed'] }
  };
  if (excludeExamId) {
    filter.examId = { $ne: new mongoose.Types.ObjectId(excludeExamId) };
  }

  // Also query directly from Exam collection to guarantee 100% data consistency even before full sync
  const examQuery = {
    status: { $in: ['published', 'closed'] }
  };
  if (excludeExamId) {
    examQuery._id = { $ne: excludeExamId };
  }
  const publishedExams = await Exam.find(examQuery).select('_id title status date questions');

  const usageMap = new Map();

  for (const exam of publishedExams) {
    if (!exam.questions || exam.questions.length === 0) continue;
    for (const q of exam.questions) {
      const qId = String(q._id || q.id || q);
      if (!usageMap.has(qId)) {
        usageMap.set(qId, {
          count: 0,
          exams: []
        });
      }
      const record = usageMap.get(qId);
      record.count += 1;
      record.exams.push({
        examId: String(exam._id),
        title: exam.title,
        status: exam.status,
        date: exam.date
      });
    }
  }

  return usageMap;
}

/**
 * Determine question IDs currently in running or upcoming exams
 * Running/Upcoming means: status === 'published' and date >= today (or within today's time window)
 */
export async function getRunningOrUpcomingQuestionIds(excludeExamId = null) {
  const today = getTodayString();
  const query = {
    status: 'published',
    $or: [
      { date: { $gte: today } },
      // Include any published exam created within the last 24 hours as active
      { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    ]
  };

  if (excludeExamId) {
    query._id = { $ne: excludeExamId };
  }

  const activeExams = await Exam.find(query).select('_id title date questions');
  const runningIds = new Set();

  for (const exam of activeExams) {
    if (!exam.questions) continue;
    for (const q of exam.questions) {
      runningIds.add(String(q._id || q.id || q));
    }
  }

  return runningIds;
}

/**
 * Get subject-wise availability summary for the admin UI
 */
export async function getAvailableQuestionCountsBySubject(excludeExamId = null) {
  const [usageMap, runningIds] = await Promise.all([
    getQuestionUsageMap(excludeExamId),
    getRunningOrUpcomingQuestionIds(excludeExamId)
  ]);

  const allQuestions = await Question.find().select('_id subject category topic marks');

  // Group questions by subject
  const subjectMap = {};

  for (const q of allQuestions) {
    const subj = (q.subject || 'সাধারণ').trim();
    if (!subjectMap[subj]) {
      subjectMap[subj] = {
        subject: subj,
        total: 0,
        unused: 0,
        used: 0,
        running: 0,
        availableForAuto: 0,
        availableForCustom: 0
      };
    }

    const qId = String(q._id);
    const isUsed = usageMap.has(qId) && usageMap.get(qId).count > 0;
    const isRunning = runningIds.has(qId);

    subjectMap[subj].total += 1;

    if (isRunning) {
      subjectMap[subj].running += 1;
    }

    if (isUsed) {
      subjectMap[subj].used += 1;
    } else {
      subjectMap[subj].unused += 1;
    }

    // Auto mode: question must NOT be used in previous exams AND must NOT be running
    if (!isUsed && !isRunning) {
      subjectMap[subj].availableForAuto += 1;
    }

    // Custom mode: question can be previously used, but MUST NOT be in running/upcoming exam
    if (!isRunning) {
      subjectMap[subj].availableForCustom += 1;
    }
  }

  return Object.values(subjectMap).sort((a, b) => a.subject.localeCompare(b.subject, 'bn'));
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Automatic Question Selection Algorithm
 * @param {Object} params
 * @param {Object} params.distribution - { [subjectName]: count }
 * @param {Array<string>} [params.manualSelectedIds] - IDs of questions already manually chosen in Hybrid mode
 * @param {string} [params.excludeExamId] - Exam ID being edited (if applicable)
 */
export async function autoSelectQuestionsForSubjects({
  distribution = {},
  manualSelectedIds = [],
  excludeExamId = null
}) {
  const [usageMap, runningIds] = await Promise.all([
    getQuestionUsageMap(excludeExamId),
    getRunningOrUpcomingQuestionIds(excludeExamId)
  ]);

  const cleanManualIds = new Set(manualSelectedIds.map(String));

  // Determine manual questions per subject to adjust needed count
  let manualQuestionsDocs = [];
  if (cleanManualIds.size > 0) {
    manualQuestionsDocs = await Question.find({ _id: { $in: Array.from(cleanManualIds) } });
  }

  const manualCountBySubject = {};
  for (const mq of manualQuestionsDocs) {
    const subj = mq.subject || 'সাধারণ';
    manualCountBySubject[subj] = (manualCountBySubject[subj] || 0) + 1;
  }

  const selectedQuestions = [];
  const subjectBreakdown = {};

  // For each subject in the distribution
  for (const [subject, targetCount] of Object.entries(distribution)) {
    const count = Number(targetCount) || 0;
    if (count <= 0) continue;

    const manualCount = manualCountBySubject[subject] || 0;
    const neededAutoCount = Math.max(0, count - manualCount);

    subjectBreakdown[subject] = {
      required: count,
      manual: manualCount,
      auto: neededAutoCount,
      selected: []
    };

    // Add manual questions for this subject first
    const manualsForThisSubject = manualQuestionsDocs.filter((q) => (q.subject || 'সাধারণ') === subject);
    for (const mq of manualsForThisSubject) {
      selectedQuestions.push({
        ...mq.toObject(),
        selectionType: 'manual',
        isPreviouslyUsed: usageMap.has(String(mq._id))
      });
      subjectBreakdown[subject].selected.push(String(mq._id));
    }

    if (neededAutoCount === 0) {
      continue;
    }

    // Query candidate questions for this subject
    const candidates = await Question.find({ subject }).lean();

    // Filter out:
    // 1. Used questions (in any published/closed exam)
    // 2. Running/upcoming questions
    // 3. Manually selected questions
    const eligibleQuestions = candidates.filter((q) => {
      const qId = String(q._id);
      if (cleanManualIds.has(qId)) return false;
      if (usageMap.has(qId) && usageMap.get(qId).count > 0) return false;
      if (runningIds.has(qId)) return false;
      return true;
    });

    if (eligibleQuestions.length < neededAutoCount) {
      const availableCount = eligibleQuestions.length;
      throw new Error(
        `"${subject}" বিষয়ে ${neededAutoCount}টি অপ্রচলিত প্রশ্ন প্রয়োজন, কিন্তু বর্তমানে মাত্র ${availableCount}টি ব্যবহারযোগ্য প্রশ্ন পাওয়া গেছে।`
      );
    }

    // Random selection
    const shuffled = shuffleArray(eligibleQuestions);
    const chosen = shuffled.slice(0, neededAutoCount);

    for (const q of chosen) {
      selectedQuestions.push({
        ...q,
        selectionType: 'auto',
        isPreviouslyUsed: false
      });
      subjectBreakdown[subject].selected.push(String(q._id));
    }
  }

  return {
    questions: selectedQuestions,
    subjectBreakdown,
    totalSelected: selectedQuestions.length
  };
}

/**
 * Regenerate questions for a specific subject or all subjects
 */
export async function regenerateQuestionsSelection({
  distribution = {},
  manualSelectedIds = [],
  currentSelectedIds = [],
  targetSubject = null,
  excludeExamId = null
}) {
  if (!targetSubject) {
    // Regenerate everything
    return autoSelectQuestionsForSubjects({
      distribution,
      manualSelectedIds,
      excludeExamId
    });
  }

  // Regenerate only for targetSubject
  const targetCount = Number(distribution[targetSubject]) || 0;
  if (targetCount <= 0) {
    throw new Error(`"${targetSubject}" বিষয়ে কোনো প্রশ্ন নির্ধারণ করা নেই।`);
  }

  const [usageMap, runningIds] = await Promise.all([
    getQuestionUsageMap(excludeExamId),
    getRunningOrUpcomingQuestionIds(excludeExamId)
  ]);

  const cleanManualIds = new Set(manualSelectedIds.map(String));

  // Find manual questions for targetSubject
  const manualDocs = await Question.find({
    _id: { $in: Array.from(cleanManualIds) },
    subject: targetSubject
  });
  const manualCount = manualDocs.length;
  const neededAuto = Math.max(0, targetCount - manualCount);

  // Exclude current questions from other subjects to avoid duplicates
  const otherSelectedIds = new Set(
    currentSelectedIds
      .map(String)
      .filter((id) => !manualDocs.some((m) => String(m._id) === id))
  );

  const candidates = await Question.find({ subject: targetSubject }).lean();
  const eligible = candidates.filter((q) => {
    const qId = String(q._id);
    if (cleanManualIds.has(qId)) return false;
    if (usageMap.has(qId) && usageMap.get(qId).count > 0) return false;
    if (runningIds.has(qId)) return false;
    return true;
  });

  if (eligible.length < neededAuto) {
    throw new Error(
      `"${targetSubject}" বিষয়ে ${neededAuto}টি নতুন প্রশ্ন প্রয়োজন, কিন্তু মাত্র ${eligible.length}টি ব্যবহারযোগ্য প্রশ্ন পাওয়া গেছে।`
    );
  }

  const shuffled = shuffleArray(eligible);
  const newlyChosen = shuffled.slice(0, neededAuto);

  const newSubjectQuestions = [
    ...manualDocs.map((m) => ({
      ...m.toObject(),
      selectionType: 'manual',
      isPreviouslyUsed: usageMap.has(String(m._id))
    })),
    ...newlyChosen.map((q) => ({
      ...q,
      selectionType: 'auto',
      isPreviouslyUsed: false
    }))
  ];

  return {
    subject: targetSubject,
    questions: newSubjectQuestions
  };
}

/**
 * Strict Pre-Save / Publish Validation
 * Validates availability, duplicate prevention, and running exam conflict
 */
export async function validateQuestionsForExamSave({
  questionIds = [],
  selectionMode = 'auto',
  manualSelectedIds = [],
  excludeExamId = null
}) {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error('পরীক্ষার জন্য অন্তত একটি প্রশ্ন নির্বাচন করতে হবে।');
  }

  // 1. Check for duplicates within the current exam
  const seenIds = new Set();
  const duplicates = [];
  for (const id of questionIds) {
    const sId = String(id);
    if (seenIds.has(sId)) {
      duplicates.push(sId);
    }
    seenIds.add(sId);
  }

  if (duplicates.length > 0) {
    throw new Error('একই পরীক্ষাটিতে একই প্রশ্ন একাধিকবার যুক্ত করা যাবে না।');
  }

  // 2. Fetch questions from DB
  const existingQuestions = await Question.find({ _id: { $in: Array.from(seenIds) } }).lean();
  if (existingQuestions.length !== seenIds.size) {
    throw new Error('নির্বাচিত কিছু প্রশ্ন ডাটাবেজে খুঁজে পাওয়া যায়নি।');
  }

  // 3. Check for running/upcoming exams conflict (FORBIDDEN for all modes)
  const runningIds = await getRunningOrUpcomingQuestionIds(excludeExamId);
  const conflictingRunning = existingQuestions.filter((q) => runningIds.has(String(q._id)));
  if (conflictingRunning.length > 0) {
    const conflictSample = conflictingRunning[0].questionText || conflictingRunning[0].subject;
    throw new Error(
      `"${conflictSample.slice(0, 40)}..." প্রশ্নটি বর্তমানে অন্য একটি সক্রিয়/চলমান পরীক্ষায় ব্যবহৃত হচ্ছে। এটি নির্বাচন করা যাবে না।`
    );
  }

  // 4. In Automatic Mode or for the automatic portion of Hybrid Mode:
  // Must NOT be used in previous published/closed exams
  const usageMap = await getQuestionUsageMap(excludeExamId);
  const manualSet = new Set(manualSelectedIds.map(String));

  if (selectionMode === 'auto') {
    const previouslyUsed = existingQuestions.filter((q) => usageMap.has(String(q._id)));
    if (previouslyUsed.length > 0) {
      const conflictSample = previouslyUsed[0].questionText || previouslyUsed[0].subject;
      throw new Error(
        `স্বয়ংক্রিয় মোডে পূর্বের ব্যবহৃত প্রশ্ন যুক্ত করা যায় না। ("${conflictSample.slice(0, 40)}..." ইতোমধ্যে পূর্বে ব্যবহৃত হয়েছে)`
      );
    }
  } else if (selectionMode === 'hybrid') {
    // Non-manual questions must be completely unused
    const autoPortion = existingQuestions.filter((q) => !manualSet.has(String(q._id)));
    const previouslyUsedAuto = autoPortion.filter((q) => usageMap.has(String(q._id)));
    if (previouslyUsedAuto.length > 0) {
      throw new Error(
        'হাইব্রিড মোডের স্বয়ংক্রিয় অংশে পূর্বের ব্যবহৃত প্রশ্ন চলে এসেছে। অনুগ্রহ করে প্রশ্ন পুনরায় নির্বাচন করুন।'
      );
    }
  }

  return true;
}

/**
 * Record question usage when an exam is created or updated
 */
export async function recordExamQuestionUsage({
  examId,
  examTitle,
  examStatus,
  examDate,
  questionIds
}) {
  if (!examId) return;

  const cleanIds = Array.from(new Set(questionIds.map(String)));

  // Remove existing usage records for this exam
  await QuestionUsage.deleteMany({ examId });

  if (cleanIds.length === 0) return;

  const records = cleanIds.map((qId) => ({
    questionId: qId,
    examId,
    examTitle: examTitle || '',
    examStatus: examStatus || 'draft',
    examDate: examDate || '',
    usedAt: new Date()
  }));

  try {
    await QuestionUsage.insertMany(records, { ordered: false });
  } catch (err) {
    // Ignore duplicate key errors if already present
  }
}

/**
 * Remove question usage when an exam is deleted
 */
export async function removeExamQuestionUsage(examId) {
  if (!examId) return;
  await QuestionUsage.deleteMany({ examId });
}

/**
 * Update exam status in QuestionUsage collection
 */
export async function updateExamQuestionUsageStatus(examId, newStatus) {
  if (!examId) return;
  await QuestionUsage.updateMany({ examId }, { $set: { examStatus: newStatus } });
}

export default {
  syncQuestionUsageFromExams,
  getQuestionUsageMap,
  getRunningOrUpcomingQuestionIds,
  getAvailableQuestionCountsBySubject,
  autoSelectQuestionsForSubjects,
  regenerateQuestionsSelection,
  validateQuestionsForExamSave,
  recordExamQuestionUsage,
  removeExamQuestionUsage,
  updateExamQuestionUsageStatus
};
