import Student from '../models/Student.js';
import Submission from '../models/Submission.js';

export const getAllStudentsAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { whatsapp: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    const studentsWithStats = await Promise.all(
      students.map(async (st) => {
        const obj = st.toObject ? st.toObject() : { ...st };
        obj.whatsappNumber = obj.whatsappNumber || obj.whatsapp;
        const locParts = [obj.location?.upazila, obj.location?.district, obj.location?.division].filter(Boolean);
        obj.address = obj.address || locParts.join(', ') || '—';

        const subs = await Submission.find({
          $or: [
            { studentId: st._id },
            { whatsappNumber: st.whatsapp },
            ...(st.firebaseUid ? [{ firebaseUid: st.firebaseUid }] : [])
          ]
        }).select('score percentage totalQuestions passed');

        obj.totalExams = subs.length;
        if (subs.length > 0) {
          const sumPct = subs.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
          obj.avgPercentage = Math.round(sumPct / subs.length);
        } else {
          obj.avgPercentage = 0;
        }

        return obj;
      })
    );

    return res.status(200).json({
      success: true,
      count: studentsWithStats.length,
      data: studentsWithStats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'শিক্ষার্থীদের তালিকা আনতে সমস্যা হয়েছে।'
    });
  }
};

export const getStudentByFirebaseUid = async (req, res) => {
  try {
    const { uid } = req.params;
    const student = await Student.findOne({ firebaseUid: uid });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী পাওয়া যায়নি।'
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const student = await Student.findOne({
      $or: [{ firebaseUid: uid }, ...(uid.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: uid }] : [])]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী পাওয়া যায়নি।'
      });
    }

    const { name, whatsapp, photoURL, location, education } = req.body;

    if (name) student.name = name;
    if (whatsapp) student.whatsapp = whatsapp;
    if (photoURL) student.photoURL = photoURL;
    if (location) student.location = { ...student.location, ...location };
    if (education) student.education = { ...student.education, ...education };

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।'
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী খুঁজে পাওয়া যায়নি।'
      });
    }

    await Student.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'শিক্ষার্থী সফলভাবে মুছে ফেলা হয়েছে।'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'শিক্ষার্থী মুছে ফেলতে সমস্যা হয়েছে।'
    });
  }
};

export default {
  getAllStudentsAdmin,
  getStudentByFirebaseUid,
  updateStudentProfile,
  deleteStudent
};
