import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Asia/Dhaka Date Calculations
    // Formats today's date in Dhaka timezone as 'YYYY-MM-DD'
    const todayDhakaStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    // Dhaka start of day and end of day in UTC
    const todayStartDhaka = new Date(`${todayDhakaStr}T00:00:00.000+06:00`);
    const todayEndDhaka = new Date(`${todayDhakaStr}T23:59:59.999+06:00`);

    // 1. Basic counts across collections
    const [
      todayExamsCount,
      totalStudentsCount,
      todayParticipantsCount,
      totalQuestionsBank,
      totalSubmissions,
      passedSubmissions,
      recentSubmissions,
      recentExams
    ] = await Promise.all([
      // 1. Today's exams in Asia/Dhaka
      Exam.countDocuments({
        $or: [
          { date: todayDhakaStr },
          { date: { $regex: `^${todayDhakaStr}` } }
        ]
      }),

      // 2. Real registered students (excludes admin roles)
      Student.countDocuments({
        role: { $nin: ['super_admin', 'admin', 'editor', 'content_editor'] }
      }),

      // 3. Today's participants (submissions submitted today in Asia/Dhaka)
      Submission.countDocuments({
        $or: [
          { submittedAt: { $gte: todayStartDhaka, $lte: todayEndDhaka } },
          { submittedAt: null, createdAt: { $gte: todayStartDhaka, $lte: todayEndDhaka } }
        ]
      }),

      // 7. Question Bank stock
      Question.countDocuments(),

      // Total submissions & passed for pass rate
      Submission.countDocuments(),
      Submission.countDocuments({ passed: true }),

      // Recent activity
      Submission.find()
        .sort({ submittedAt: -1, createdAt: -1 })
        .limit(5)
        .populate('examId', 'title slug'),
      Exam.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // 4. Average score & 5. Highest score calculation via MongoDB aggregation
    const scoreStats = await Submission.aggregate([
      {
        $project: {
          calcPercentage: {
            $cond: {
              if: { $and: [{ $ne: ['$percentage', null] }, { $gte: ['$percentage', 0] }] },
              then: '$percentage',
              else: {
                $cond: {
                  if: { $and: [{ $gt: ['$totalQuestions', 0] }, { $ne: ['$score', null] }] },
                  then: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] },
                  else: 0
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$calcPercentage' },
          maxScore: { $max: '$calcPercentage' }
        }
      }
    ]);

    const averageScore = (scoreStats.length > 0 && scoreStats[0].avgScore != null)
      ? Math.round(scoreStats[0].avgScore * 10) / 10
      : 0;

    const highestScore = (scoreStats.length > 0 && scoreStats[0].maxScore != null)
      ? Math.round(scoreStats[0].maxScore * 10) / 10
      : 0;

    // 6. Pass Rate using existing pass/fail application rules
    const passRate = totalSubmissions > 0
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

    // 8. Last 7 Days Daily Participation in Asia/Dhaka
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const ymd = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(targetDate);
      const label = new Intl.DateTimeFormat('bn-BD', {
        timeZone: 'Asia/Dhaka',
        day: 'numeric',
        month: 'long'
      }).format(targetDate);
      days.push({ ymd, label });
    }

    const oldestDateStart = new Date(`${days[0].ymd}T00:00:00.000+06:00`);

    const dailyAgg = await Submission.aggregate([
      {
        $match: {
          $or: [
            { submittedAt: { $gte: oldestDateStart } },
            { submittedAt: null, createdAt: { $gte: oldestDateStart } }
          ]
        }
      },
      {
        $project: {
          dhakaDay: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $ifNull: ['$submittedAt', '$createdAt'] },
              timezone: 'Asia/Dhaka'
            }
          }
        }
      },
      {
        $group: {
          _id: '$dhakaDay',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = {};
    for (const row of dailyAgg) {
      if (row._id) {
        countMap[row._id] = row.count;
      }
    }

    const dailyParticipation = days.map((d) => ({
      day: d.label,
      participants: countMap[d.ymd] || 0
    }));

    // 9 & 10. Answer Breakdown / Pie Chart from actual submission & answer data
    const answerStats = await Submission.aggregate([
      {
        $group: {
          _id: null,
          totalCorrect: { $sum: '$correctCount' },
          totalWrong: { $sum: '$wrongCount' },
          totalUnanswered: { $sum: '$unansweredCount' }
        }
      }
    ]);

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnanswered = 0;

    if (answerStats.length > 0) {
      totalCorrect = answerStats[0].totalCorrect || 0;
      totalWrong = answerStats[0].totalWrong || 0;
      totalUnanswered = answerStats[0].totalUnanswered || 0;
    }

    const scoreDistribution = [
      {
        name: 'সঠিক',
        value: totalCorrect,
        color: '#16A34A'
      },
      {
        name: 'ভুল',
        value: totalWrong,
        color: '#DC2626'
      },
      {
        name: 'অনুত্তরিত',
        value: totalUnanswered,
        color: '#94A3B8'
      }
    ];

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          todayExamsCount,
          totalStudentsCount,
          todayParticipantsCount,
          averageScore,
          highestScore,
          passRate,
          totalQuestionsBank
        },
        charts: {
          dailyParticipation,
          scoreDistribution
        },
        // Backward compatibility properties for any legacy components
        totalStudents: totalStudentsCount,
        totalExams: await Exam.countDocuments(),
        publishedExams: await Exam.countDocuments({ status: 'published' }),
        totalQuestions: totalQuestionsBank,
        totalSubmissions,
        passedSubmissions,
        averageScore,
        passRate,
        recentSubmissions,
        recentExams
      }
    });
  } catch (error) {
    console.error('[Analytics Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'অ্যানালিটিক্স লোড করতে সমস্যা হয়েছে।'
    });
  }
};

export const getQuestionsAnalytics = async (req, res) => {
  try {
    const questions = await Question.find().lean();
    const submissions = await Submission.find({}, 'answers').lean();

    const statsMap = {};
    for (const sub of submissions) {
      if (Array.isArray(sub.answers)) {
        for (const ans of sub.answers) {
          if (!ans.questionId) continue;
          const qIdStr = String(ans.questionId);
          if (!statsMap[qIdStr]) {
            statsMap[qIdStr] = { attempts: 0, correctCount: 0, wrongCount: 0 };
          }
          statsMap[qIdStr].attempts += 1;
          if (ans.isCorrect) {
            statsMap[qIdStr].correctCount += 1;
          } else {
            statsMap[qIdStr].wrongCount += 1;
          }
        }
      }
    }

    const data = questions.map((q) => {
      const qIdStr = String(q._id);
      const stat = statsMap[qIdStr] || { attempts: 0, correctCount: 0, wrongCount: 0 };
      const attempts = stat.attempts;
      const correctCount = stat.correctCount;
      const wrongCount = stat.wrongCount;
      const successRate = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;
      const isHard = attempts >= 3 && successRate < 50;

      return {
        questionId: q._id,
        questionText: q.questionText,
        subject: q.subject || 'সাধারণ',
        category: q.category || 'জেনারেল',
        attempts,
        correctCount,
        wrongCount,
        successRate,
        isHard
      };
    });

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রশ্ন অ্যানালিটিক্স লোড করা যায়নি।'
    });
  }
};

export default {
  getDashboardAnalytics,
  getQuestionsAnalytics
};
