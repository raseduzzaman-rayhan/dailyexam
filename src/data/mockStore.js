// Pure Frontend Client-side Store for Online MCQ Exam Platform
// Stored in localStorage with realistic initial educational data

const STORAGE_KEY_PREFIX = 'exam_app_';

const initialQuestions = [
  {
    _id: 'q_1',
    subject: 'বাংলা সাহিত্য',
    category: 'প্রাচীন ও মধ্যযুগ',
    questionText: 'বাংলা সাহিত্যের প্রাচীনতম নিদর্শন "চর্যাপদ" কোন ছন্দে রচিত?',
    options: [
      { id: 'A', text: 'অক্ষরবৃত্ত' },
      { id: 'B', text: 'মাত্রাবৃত্ত' },
      { id: 'C', text: 'স্বরবৃত্ত' },
      { id: 'D', text: 'অমিত্রাক্ষর' }
    ],
    correctAnswer: 'B',
    explanation: 'চর্যাপদ মূলত মাত্রাবৃত্ত বা পাদাকুলক ছন্দে রচিত। এর অধিকাংশ পদে ১৬ মাত্রার চতুষ্পদী চরণ দেখা যায়।',
    marks: 1,
    difficulty: 'medium',
    tags: ['চর্যাপদ', 'ছন্দ', 'বিসিএস'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_2',
    subject: 'বাংলা ব্যাকরণ',
    category: 'সমাস',
    questionText: '"উপশহর" কোন সমাসের উদাহরণ?',
    options: [
      { id: 'A', text: 'তৎপুরুষ সমাস' },
      { id: 'B', text: 'কর্মধারয় সমাস' },
      { id: 'C', text: 'অব্যয়ীভাব সমাস' },
      { id: 'D', text: 'বহুব্রীহি সমাস' }
    ],
    correctAnswer: 'C',
    explanation: 'পূর্বপদে অব্যয়যোগে নিষ্পন্ন সমাসে যদি অব্যয়েরই অর্থ প্রধানরূপে প্রতীয়মান হয়, তবে তাকে অব্যয়ীভাব সমাস বলে। শহরের সদৃশ = উপশহর (সাদৃশ্য অর্থে "উপ" অব্যয়)।',
    marks: 1,
    difficulty: 'easy',
    tags: ['ব্যাকরণ', 'সমাস'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_3',
    subject: 'বাংলাদেশ বিষয়াবলী',
    category: 'মুক্তিযুদ্ধ',
    questionText: '১৯৭১ সালের মুক্তিযুদ্ধে মুজিবনগর সরকারের রাষ্ট্রপতি কে ছিলেন?',
    options: [
      { id: 'A', text: 'তাজউদ্দীন আহমদ' },
      { id: 'B', text: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান' },
      { id: 'C', text: 'সৈয়দ নজরুল ইসলাম' },
      { id: 'D', text: 'ক্যাপ্টেন এম মনসুর আলী' }
    ],
    correctAnswer: 'B',
    explanation: '১০ এপ্রিল ১৯৭১ গঠিত মুজিবনগর সরকারের রাষ্ট্রপতি ছিলেন বঙ্গবন্ধু শেখ মুজিবুর রহমান। তাঁর অনুপস্থিতিতে সৈয়দ নজরুল ইসলাম অস্থায়ী রাষ্ট্রপতির দায়িত্ব পালন করেন।',
    marks: 1,
    difficulty: 'easy',
    tags: ['মুজিবনগর', 'ইতিহাস', 'মুক্তিযুদ্ধ'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_4',
    subject: 'বাংলাদেশ বিষয়াবলী',
    category: 'সংবিধান',
    questionText: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের মূলনীতি কয়টি?',
    options: [
      { id: 'A', text: '৩টি' },
      { id: 'B', text: '৪টি' },
      { id: 'C', text: '৫টি' },
      { id: 'D', text: '৭টি' }
    ],
    correctAnswer: 'B',
    explanation: 'সংবিধানের ৮(১) অনুচ্ছেদ অনুযায়ী রাষ্ট্র পরিচালনার ৪টি মূলনীতি হলো: জাতীয়তাবাদ, সমাজতন্ত্র, গণতন্ত্র এবং ধর্মনিরপেক্ষতা।',
    marks: 1,
    difficulty: 'easy',
    tags: ['সংবিধান', 'রাষ্ট্রবিজ্ঞান'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_5',
    subject: 'সাধারণ বিজ্ঞান',
    category: 'জীববিজ্ঞান',
    questionText: 'রক্তের কোন উপাদান অক্সিজেন পরিবহনে সরাসরি ভূমিকা রাখে?',
    options: [
      { id: 'A', text: 'শ্বেত রক্তকণিকা' },
      { id: 'B', text: 'অনুচক্রিকা' },
      { id: 'C', text: 'হিমোগ্লোবিন' },
      { id: 'D', text: 'রক্তরস' }
    ],
    correctAnswer: 'C',
    explanation: 'লোহিত রক্তকণিকায় অবস্থিত হিমোগ্লোবিন ফুসফুস থেকে দেহের প্রতিটি কোষে অক্সিহিমোগ্লোবিন যৌগ হিসেবে অক্সিজেন পরিবহন করে।',
    marks: 1,
    difficulty: 'easy',
    tags: ['বিজ্ঞান', 'রক্ত'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_6',
    subject: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    category: 'কম্পিউটার',
    questionText: 'কোনটি কম্পিউটারের স্থায়ী বা অনুদ্বায়ী (Non-volatile) স্মৃতিশক্তি?',
    options: [
      { id: 'A', text: 'RAM' },
      { id: 'B', text: 'ROM' },
      { id: 'C', text: 'Cache Memory' },
      { id: 'D', text: 'Virtual Memory' }
    ],
    correctAnswer: 'B',
    explanation: 'ROM (Read Only Memory) হলো নন-ভোলাটাইল বা স্থায়ী মেমোরি। বিদ্যুৎ সংযোগ বিচ্ছিন্ন হলেও এতে সংরক্ষিত তথ্য অবিকৃত থাকে।',
    marks: 1,
    difficulty: 'medium',
    tags: ['আইসিটি', 'কম্পিউটার'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_7',
    subject: 'গাণিতিক যুক্তি',
    category: 'পাটিগণিত',
    questionText: 'একটি সংখ্যা ৩০১ থেকে যত বড়, ৩৮১ থেকে তত ছোট। সংখ্যাটি কত?',
    options: [
      { id: 'A', text: '৩৪১' },
      { id: 'B', text: '৩৪০' },
      { id: 'C', text: '৩৪২' },
      { id: 'D', text: '৩৪৪' }
    ],
    correctAnswer: 'A',
    explanation: 'সংখ্যাটি = (৩০১ + ৩৮১) ÷ ২ = ৬৮২ ÷ ২ = ৩৪১।',
    marks: 1,
    difficulty: 'easy',
    tags: ['গণিত', 'পাটিগণিত'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_8',
    subject: 'ইংরেজি',
    category: 'Grammar',
    questionText: 'Choose the correct preposition: "He is confident ___ his success."',
    options: [
      { id: 'A', text: 'for' },
      { id: 'B', text: 'of' },
      { id: 'C', text: 'about' },
      { id: 'D', text: 'with' }
    ],
    correctAnswer: 'B',
    explanation: 'Appropriate preposition: "Confident of" অর্থ কোনো বিষয়ে দৃঢ় বিশ্বাসী বা আত্মবিশ্বাসী।',
    marks: 1,
    difficulty: 'medium',
    tags: ['English', 'Preposition'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_9',
    subject: 'আন্তর্জাতিক বিষয়াবলী',
    category: 'ভূরাজনীতি',
    questionText: 'জাতিসংঘের বর্তমান সদস্য সংখ্যা কত?',
    options: [
      { id: 'A', text: '১৯১' },
      { id: 'B', text: '১৯২' },
      { id: 'C', text: '১৯৩' },
      { id: 'D', text: '১৯৫' }
    ],
    correctAnswer: 'C',
    explanation: 'জাতিসংঘের ১৯৩তম সর্বশেষ সদস্য রাষ্ট্র দক্ষিণ সুদান (১৪ জুলাই ২০১১)।',
    marks: 1,
    difficulty: 'medium',
    tags: ['আন্তর্জাতিক', 'জাতিসংঘ'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_10',
    subject: 'ভূগোল ও পরিবেশ',
    category: 'বাংলাদেশ ভূগোল',
    questionText: 'বাংলাদেশের সর্বউত্তরের উপজেলার নাম কী?',
    options: [
      { id: 'A', text: 'তেঁতুলিয়া' },
      { id: 'B', text: 'পঞ্চগড় সদর' },
      { id: 'C', text: 'বাংলাবান্ধা' },
      { id: 'D', text: 'রুমা' }
    ],
    correctAnswer: 'A',
    explanation: 'বাংলাদেশের সর্বউত্তরের জেলা পঞ্চগড়, সর্বউত্তরের উপজেলা তেঁতুলিয়া এবং সর্বউত্তরের স্থান বাংলাবান্ধা।',
    marks: 1,
    difficulty: 'easy',
    tags: ['ভূগোল', 'সীমান্ত'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_11',
    subject: 'বাংলা সাহিত্য',
    category: 'আধুনিক যুগ',
    questionText: 'বিশ্বকবি রবীন্দ্রনাথ ঠাকুর কত সালে সাহিত্যে নোবেল পুরস্কার লাভ করেন?',
    options: [
      { id: 'A', text: '১৯১১' },
      { id: 'B', text: '১৯১২' },
      { id: 'C', text: '১৯১৩' },
      { id: 'D', text: '১৯১৪' }
    ],
    correctAnswer: 'C',
    explanation: '১৯১৩ সালে গীতাঞ্জলি (Song Offerings) কাব্যগ্রন্থের ইংরেজি অনুবাদের জন্য তিনি এশিয়ার প্রথম নোবেল বিজয়ী হন।',
    marks: 1,
    difficulty: 'easy',
    tags: ['রবীন্দ্রনাথ', 'নোবেল'],
    createdBy: 'Super Admin',
  },
  {
    _id: 'q_12',
    subject: 'সাধারণ বিজ্ঞান',
    category: 'পরিবেশ বিজ্ঞান',
    questionText: 'প্রতি বছর বিশ্ব পরিবেশ দিবস কোন তারিখে পালিত হয়?',
    options: [
      { id: 'A', text: '১ মে' },
      { id: 'B', text: '৫ জুন' },
      { id: 'C', text: '২১ ফেব্রুয়ারি' },
      { id: 'D', text: '২৬ মার্চ' }
    ],
    correctAnswer: 'B',
    explanation: '১৯৭৪ সাল থেকে প্রতি বছর ৫ জুন বিশ্বব্যাপী পরিবেশ সচেতনতা তৈরিতে এই দিবস পালিত হয়ে আসছে।',
    marks: 1,
    difficulty: 'easy',
    tags: ['পরিবেশ', 'আন্তর্জাতিক দিবস'],
    createdBy: 'Super Admin',
  }
];

const initialExams = [
  {
    _id: 'exam_1',
    title: 'দৈনিক বিসিএস ও বিশ্ববিদ্যালয় ভর্তি মডেল টেস্ট - ০১',
    slug: 'daily-2026-09-08',
    description: 'বাংলা সাহিত্য, ব্যাকরণ, মুক্তিযুদ্ধ, বিজ্ঞান ও গণিত সমন্বয়ে আজকের বিশেষ অনলাইন মূল্যায়ন পরীক্ষা।',
    date: new Date().toISOString().split('T')[0],
    startTime: '00:00',
    endTime: '23:59',
    duration: 10,
    questions: ['q_1', 'q_2', 'q_3', 'q_4', 'q_5', 'q_6', 'q_7', 'q_8', 'q_9', 'q_10'],
    totalMarks: 10,
    passingPercentage: 50,
    status: 'published',
    leaderboardEnabled: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    createdBy: 'Super Admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'exam_2',
    title: 'সাধারণ জ্ঞান ও বাংলাদেশ বিষয়াবলী স্পেশাল কুইজ',
    slug: 'gk-bangladesh-special',
    description: 'বাংলাদেশ মুক্তিযুদ্ধ, সংবিধান, জাতীয় বিষয়াবলী ও সাম্প্রতিক তথ্যের ওপর দ্রুত মূল্যায়ন পরীক্ষা।',
    date: new Date().toISOString().split('T')[0],
    startTime: '00:00',
    endTime: '23:59',
    duration: 5,
    questions: ['q_3', 'q_4', 'q_9', 'q_10'],
    totalMarks: 4,
    passingPercentage: 50,
    status: 'published',
    leaderboardEnabled: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    createdBy: 'Super Admin',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'exam_3',
    title: 'বাংলা ভাষা ও সাহিত্য স্পেশাল মক টেস্ট',
    slug: 'bangla-special-mock',
    description: 'চর্যাপদ, ব্যাকরণ, সমাস ও সাহিত্যের বাছাইকৃত প্রশ্নের ওপর বিশেষ অনুশীলন টেস্ট।',
    date: new Date().toISOString().split('T')[0],
    startTime: '00:00',
    endTime: '23:59',
    duration: 8,
    questions: ['q_1', 'q_2', 'q_11'],
    totalMarks: 3,
    passingPercentage: 50,
    status: 'published',
    leaderboardEnabled: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    createdBy: 'Super Admin',
    createdAt: new Date().toISOString(),
  }
];

const initialSubmissions = [
  {
    _id: 'sub_1',
    examId: 'exam_1',
    examSlug: 'daily-2026-09-08',
    examTitle: 'দৈনিক বিসিএস ও বিশ্ববিদ্যালয় ভর্তি মডেল টেস্ট - ০১',
    studentName: 'রাকিবুল হাসান',
    whatsappNumber: '01711223344',
    address: 'মিরপুর-১০, ঢাকা',
    answers: [
      { questionId: 'q_1', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_2', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_3', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_4', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_5', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_6', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_7', selectedOption: 'A', isCorrect: true },
      { questionId: 'q_8', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_9', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_10', selectedOption: 'A', isCorrect: true },
    ],
    totalQuestions: 10,
    correctCount: 10,
    wrongCount: 0,
    unansweredCount: 0,
    score: 10,
    totalMarks: 10,
    percentage: 100,
    passed: true,
    durationSeconds: 210,
    tabSwitchCount: 0,
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    leaderboardEnabled: true,
  },
  {
    _id: 'sub_2',
    examId: 'exam_1',
    examSlug: 'daily-2026-09-08',
    examTitle: 'দৈনিক বিসিএস ও বিশ্ববিদ্যালয় ভর্তি মডেল টেস্ট - ০১',
    studentName: 'তানজিলা আক্তার',
    whatsappNumber: '01899887766',
    address: 'চকবাজার, চট্টগ্রাম',
    answers: [
      { questionId: 'q_1', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_2', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_3', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_4', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_5', selectedOption: 'A', isCorrect: false },
      { questionId: 'q_6', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_7', selectedOption: 'A', isCorrect: true },
      { questionId: 'q_8', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_9', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_10', selectedOption: 'A', isCorrect: true },
    ],
    totalQuestions: 10,
    correctCount: 9,
    wrongCount: 1,
    unansweredCount: 0,
    score: 9,
    totalMarks: 10,
    percentage: 90,
    passed: true,
    durationSeconds: 255,
    tabSwitchCount: 0,
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    leaderboardEnabled: true,
  },
  {
    _id: 'sub_3',
    examId: 'exam_1',
    examSlug: 'daily-2026-09-08',
    examTitle: 'দৈনিক বিসিএস ও বিশ্ববিদ্যালয় ভর্তি মডেল টেস্ট - ০১',
    studentName: 'মুশফিকুর রহমান',
    whatsappNumber: '01911445566',
    address: 'বোয়ালিয়া, রাজশাহী',
    answers: [
      { questionId: 'q_1', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_2', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_3', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_4', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_5', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_6', selectedOption: 'A', isCorrect: false },
      { questionId: 'q_7', selectedOption: 'A', isCorrect: true },
      { questionId: 'q_8', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_9', selectedOption: 'A', isCorrect: false },
      { questionId: 'q_10', selectedOption: 'A', isCorrect: true },
    ],
    totalQuestions: 10,
    correctCount: 8,
    wrongCount: 2,
    unansweredCount: 0,
    score: 8,
    totalMarks: 10,
    percentage: 80,
    passed: true,
    durationSeconds: 310,
    tabSwitchCount: 1,
    submittedAt: new Date(Date.now() - 10800000).toISOString(),
    leaderboardEnabled: true,
  },
  {
    _id: 'sub_4',
    examId: 'exam_1',
    examSlug: 'daily-2026-09-08',
    examTitle: 'দৈনিক বিসিএস ও বিশ্ববিদ্যালয় ভর্তি মডেল টেস্ট - ০১',
    studentName: 'সাদিয়া আফরিন',
    whatsappNumber: '01722334455',
    address: 'জিন্দাবাজার, সিলেট',
    answers: [
      { questionId: 'q_1', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_2', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_3', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_4', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_5', selectedOption: 'C', isCorrect: true },
      { questionId: 'q_6', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_7', selectedOption: 'C', isCorrect: false },
      { questionId: 'q_8', selectedOption: 'B', isCorrect: true },
      { questionId: 'q_9', selectedOption: '', isCorrect: false },
      { questionId: 'q_10', selectedOption: '', isCorrect: false },
    ],
    totalQuestions: 10,
    correctCount: 7,
    wrongCount: 1,
    unansweredCount: 2,
    score: 7,
    totalMarks: 10,
    percentage: 70,
    passed: true,
    durationSeconds: 340,
    tabSwitchCount: 0,
    submittedAt: new Date(Date.now() - 14400000).toISOString(),
    leaderboardEnabled: true,
  }
];

const initialAdmins = [
  {
    _id: 'admin_1',
    name: 'প্রধান প্রশাসক (Super Admin)',
    email: 'admin@exam.bd',
    role: 'super_admin',
    status: 'active',
    createdAt: new Date('2026-09-01T08:00:00Z').toISOString(),
  },
  {
    _id: 'admin_2',
    name: 'সহকারী সম্পাদক (Editor)',
    email: 'editor@exam.bd',
    role: 'editor',
    status: 'active',
    createdAt: new Date('2026-09-02T10:00:00Z').toISOString(),
  }
];

const initialSettings = {
  appName: 'ডেইলি এক্সাম বিডি (Daily Exam BD)',
  notice: 'স্বাগতম! প্রতিদিন রাত ৮টায় নতুন বিসিএস ও ভর্তি মডেল টেস্ট প্রকাশিত হয়। পরীক্ষায় সততা বজায় রাখুন।',
  primaryContact: 'support@exam.bd',
  whatsappNumber: '+8801711223344',
  defaultExamDuration: 15,
  defaultPassingPercentage: 50,
  leaderboardDefault: true,
  negativeMarking: 0.25,
  rulesList: [
    'প্রতিটি প্রশ্নের জন্য নির্ধারিত ১ নম্বর থাকবে।',
    'ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা হতে পারে (যদি কার্যকর থাকে)।',
    'পরীক্ষা চলাকালীন ট্যাব পরিবর্তন বা উইন্ডো মিনিমাইজ করা নিষিদ্ধ।',
    'নির্ধারিত সময় শেষ হলে পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট হয়ে যাবে।'
  ]
};

// Storage helpers
function getStored(key, defaultVal) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// In-memory + LocalStorage client mock store
export const mockStore = {
  getQuestions() {
    return getStored('questions', initialQuestions);
  },
  saveQuestions(questions) {
    setStored('questions', questions);
  },

  getExams() {
    return getStored('exams', initialExams);
  },
  saveExams(exams) {
    setStored('exams', exams);
  },

  getSubmissions() {
    return getStored('submissions', initialSubmissions);
  },
  saveSubmissions(subs) {
    setStored('submissions', subs);
  },

  getAdmins() {
    return getStored('admins', initialAdmins);
  },
  saveAdmins(admins) {
    setStored('admins', admins);
  },

  getSettings() {
    return getStored('settings', initialSettings);
  },
  saveSettings(settings) {
    setStored('settings', settings);
  },

  resetAll() {
    setStored('questions', initialQuestions);
    setStored('exams', initialExams);
    setStored('submissions', initialSubmissions);
    setStored('admins', initialAdmins);
    setStored('settings', initialSettings);
  }
};
