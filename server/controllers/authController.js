import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import { verifyFirebaseOrAppToken } from '../config/firebaseAdmin.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('[Auth] JWT_SECRET is not set in .env. Using fallback secret.');
    return 'daily-exam-bd-secret-key-2026';
  }
  return secret;
};

export async function ensureSuperAdminForFirstUser(user) {
  if (!user) return null;
  const cleanEmail = user.email ? user.email.toLowerCase().trim() : '';
  const firebaseUid = user.firebaseUid || user.uid;

  // 1. Check if this admin already exists by firebaseUid or email
  const existingAdmin = await Admin.findOne({
    $or: [
      ...(firebaseUid ? [{ firebaseUid }] : []),
      ...(cleanEmail ? [{ email: cleanEmail }] : [])
    ]
  });

  if (existingAdmin) {
    if (!existingAdmin.firebaseUid && firebaseUid) {
      existingAdmin.firebaseUid = firebaseUid;
      await existingAdmin.save();
    }
    return existingAdmin;
  }

  // 2. Check if ANY admin exists in MongoDB
  const totalAdmins = await Admin.countDocuments();
  if (totalAdmins === 0) {
    // This is the first real authenticated user attempting admin login - grant super_admin
    const newSuperAdmin = await Admin.create({
      firebaseUid: firebaseUid || '',
      name: user.name || 'প্রধান প্রশাসক (Super Admin)',
      email: cleanEmail,
      role: 'super_admin',
      status: 'active',
      isActive: true,
      lastLogin: new Date()
    });

    console.log(`[First-User Logic] Granted super_admin to first real user in MongoDB: ${cleanEmail}`);
    return newSuperAdmin;
  }

  // Later users do not automatically become super_admin
  return null;
}

export const adminFirebaseLogin = async (req, res) => {
  try {
    const { token, idToken, user } = req.body;
    const rawToken = token || idToken;

    let verifiedUser = null;

    if (rawToken) {
      try {
        verifiedUser = await verifyFirebaseOrAppToken(rawToken);
      } catch (tokenErr) {
        // If token verification failed but client sent explicit user object
        if (user && (user.email || user.uid)) {
          verifiedUser = {
            firebaseUid: user.uid || user.firebaseUid,
            email: user.email,
            name: user.displayName || user.name || ''
          };
        } else {
          throw tokenErr;
        }
      }
    } else if (user && (user.email || user.uid)) {
      verifiedUser = {
        firebaseUid: user.uid || user.firebaseUid,
        email: user.email,
        name: user.displayName || user.name || ''
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'প্রমাণীকরণ টোকেন বা ব্যবহারকারীর তথ্য প্রদান করা আবশ্যক।'
      });
    }

    const cleanEmail = verifiedUser.email ? verifiedUser.email.toLowerCase().trim() : '';
    const firebaseUid = verifiedUser.firebaseUid;

    let admin = await ensureSuperAdminForFirstUser({
      ...verifiedUser,
      email: cleanEmail,
      firebaseUid
    });

    if (!admin) {
      admin = await Admin.findOne({
        $or: [
          ...(firebaseUid ? [{ firebaseUid }] : []),
          ...(cleanEmail ? [{ email: cleanEmail }] : [])
        ]
      });
    }

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'আপনার এই পোর্টালে অ্যাডমিন অ্যাক্সেস নেই। অনুগ্রহ করে সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।'
      });
    }

    if (admin.status === 'inactive' || admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'আপনার অ্যাডমিন অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে।'
      });
    }

    // Update login timestamp and firebaseUid if newly attached
    admin.lastLogin = new Date();
    if (firebaseUid && !admin.firebaseUid) {
      admin.firebaseUid = firebaseUid;
    }
    await admin.save();

    const appToken = jwt.sign(
      {
        id: admin._id,
        firebaseUid: admin.firebaseUid,
        email: admin.email,
        role: admin.role,
        name: admin.name
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'অ্যাডমিন লগইন সফল হয়েছে।',
      token: appToken,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        firebaseUid: admin.firebaseUid,
        status: admin.status
      }
    });
  } catch (error) {
    console.error('[Admin Login Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'সার্ভার ত্রুটি। পুনরায় চেষ্টা করুন।'
    });
  }
};

export const adminPasswordLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'ইমেইল এবং পাসওয়ার্ড প্রদান করা আবশ্যক।'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'ভুল ইমেইল বা পাসওয়ার্ড।'
      });
    }

    if (admin.status === 'inactive' || admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'আপনার অ্যাকাউন্টটি নিষ্ক্রিয় রয়েছে।'
      });
    }

    if (!admin.password) {
      return res.status(400).json({
        success: false,
        message: 'এই অ্যাকাউন্টে পাসওয়ার্ড সেট করা নেই। অনুগ্রহ করে Google দিয়ে লগইন করুন।'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'ভুল ইমেইল বা পাসওয়ার্ড।'
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        firebaseUid: admin.firebaseUid,
        email: admin.email,
        role: admin.role,
        name: admin.name
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'লগইন সফল হয়েছে।',
      token,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (error) {
    console.error('[Password Login Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'সার্ভার ত্রুটি।'
    });
  }
};

export const unifiedLogin = async (req, res, next) => {
  if (req.body.token || req.body.idToken) {
    return adminFirebaseLogin(req, res, next);
  }
  return adminPasswordLogin(req, res, next);
};

export const studentRegister = async (req, res) => {
  try {
    const { firebaseUid, name, email, photoURL, whatsapp, location, education } = req.body;

    if (!name || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'নাম এবং WhatsApp নম্বর প্রদান করা আবশ্যক।'
      });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';

    let student = null;
    if (firebaseUid) {
      student = await Student.findOne({ firebaseUid });
    }
    if (!student && cleanEmail) {
      student = await Student.findOne({ email: cleanEmail });
    }

    if (student) {
      // Update existing student profile
      student.name = name;
      student.whatsapp = whatsapp;
      if (photoURL) student.photoURL = photoURL;
      if (location) student.location = { ...student.location, ...location };
      if (education) student.education = { ...student.education, ...education };
      if (firebaseUid) student.firebaseUid = firebaseUid;
      await student.save();

      const admin = await Admin.findOne({
        $or: [
          ...(firebaseUid ? [{ firebaseUid }] : []),
          ...(cleanEmail ? [{ email: cleanEmail }] : [])
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'প্রোফাইল আপডেট সফল হয়েছে।',
        student,
        admin: admin || null,
        isAdmin: Boolean(admin),
        isFirstUser: admin?.role === 'super_admin',
        role: admin?.role || 'student'
      });
    }

    const newStudent = await Student.create({
      firebaseUid: firebaseUid || `st_${Date.now()}`,
      name,
      email: cleanEmail,
      photoURL: photoURL || '',
      whatsapp,
      location: location || {},
      education: education || {},
      role: 'student',
      isActive: true
    });

    const admin = await Admin.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'নিবন্ধন সম্পন্ন হয়েছে।',
      student: newStudent,
      admin: admin || null,
      isAdmin: Boolean(admin),
      isFirstUser: admin?.role === 'super_admin',
      role: admin?.role || 'student'
    });
  } catch (error) {
    console.error('[Student Register Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'নিবন্ধন ব্যর্থ হয়েছে।'
    });
  }
};

export const getMeUnified = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let decoded = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const rawToken = authHeader.split(' ')[1];
      try {
        decoded = await verifyFirebaseOrAppToken(rawToken);
      } catch (tokenErr) {
        console.warn('[Me-Unified Token Error]:', tokenErr.message);
      }
    }

    if (!decoded) {
      return res.status(200).json({
        success: true,
        student: null,
        admin: null,
        isAdmin: false,
        isSuperAdmin: false,
        role: 'guest'
      });
    }

    const cleanEmail = decoded.email ? decoded.email.toLowerCase().trim() : '';
    const firebaseUid = decoded.firebaseUid;

    let admin = await Admin.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(decoded.id ? [{ _id: decoded.id }] : [])
      ]
    });

    // If no admin exists in system, auto-assign first authenticated user
    const totalAdmins = await Admin.countDocuments();
    if (!admin && totalAdmins === 0 && (firebaseUid || cleanEmail)) {
      admin = await ensureSuperAdminForFirstUser(decoded);
    }

    let student = await Student.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    const isAdmin = Boolean(admin && admin.status !== 'inactive' && admin.isActive !== false);

    return res.status(200).json({
      success: true,
      student: student || null,
      admin: admin || null,
      isAdmin,
      isSuperAdmin: admin?.role === 'super_admin',
      role: admin?.role || (student ? 'student' : 'guest')
    });
  } catch (error) {
    console.error('[Me-Unified Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'ব্যবহারকারী যাচাইকরণ ব্যর্থ হয়েছে।'
    });
  }
};

export const postUnifiedLogin = async (req, res) => {
  try {
    const rawToken = req.body.idToken || req.body.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        message: 'টোকেন প্রদান করা আবশ্যক।'
      });
    }

    const decoded = await verifyFirebaseOrAppToken(rawToken);
    const cleanEmail = decoded.email ? decoded.email.toLowerCase().trim() : '';
    const firebaseUid = decoded.firebaseUid;

    let admin = await Admin.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(decoded.id ? [{ _id: decoded.id }] : [])
      ]
    });

    const totalAdmins = await Admin.countDocuments();
    if (!admin && totalAdmins === 0 && (firebaseUid || cleanEmail)) {
      admin = await ensureSuperAdminForFirstUser(decoded);
    }

    let student = await Student.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    // If user is neither admin nor student, they need to complete their profile
    if (!admin && !student) {
      return res.status(200).json({
        success: true,
        needProfile: true,
        fbUser: {
          uid: firebaseUid,
          email: cleanEmail,
          name: decoded.name || '',
          photoURL: decoded.photoURL || ''
        },
        message: 'প্রোফাইল সম্পন্ন করা আবশ্যক।'
      });
    }

    const isAdmin = Boolean(admin && admin.status !== 'inactive' && admin.isActive !== false);

    return res.status(200).json({
      success: true,
      needProfile: false,
      student: student || null,
      admin: admin || null,
      isAdmin,
      isSuperAdmin: admin?.role === 'super_admin',
      role: admin?.role || 'student'
    });
  } catch (error) {
    console.error('[Unified Login Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'লগইন ব্যর্থ হয়েছে।'
    });
  }
};

export const updateStudentProfileSelf = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'প্রমাণীকরণ টোকেন আবশ্যক।'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseOrAppToken(token);
    const cleanEmail = decoded.email ? decoded.email.toLowerCase().trim() : '';
    const firebaseUid = decoded.firebaseUid;

    let student = await Student.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(decoded.id ? [{ _id: decoded.id }] : [])
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী প্রোফাইল খুঁজে পাওয়া যায়নি।'
      });
    }

    const { name, whatsapp, photoURL, location, education } = req.body;
    if (name) student.name = name.trim();
    if (whatsapp) student.whatsapp = whatsapp.trim();
    if (photoURL !== undefined) student.photoURL = photoURL;
    if (location) student.location = { ...student.location, ...location };
    if (education) student.education = { ...student.education, ...education };

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে।',
      student
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'প্রোফাইল আপডেট ব্যর্থ হয়েছে।'
    });
  }
};

export const studentFirebaseLogin = async (req, res) => {
  try {
    const { token, idToken, firebaseUid, email } = req.body;
    let uid = firebaseUid;
    let studentEmail = email;

    if (token || idToken) {
      try {
        const decoded = await verifyFirebaseOrAppToken(token || idToken);
        uid = decoded.firebaseUid || uid;
        studentEmail = decoded.email || studentEmail;
      } catch (err) {
        // fallback to supplied info
      }
    }

    if (!uid && !studentEmail) {
      return res.status(400).json({
        success: false,
        message: 'শিক্ষার্থীর তথ্য পাওয়া যায়নি।'
      });
    }

    const student = await Student.findOne({
      $or: [
        ...(uid ? [{ firebaseUid: uid }] : []),
        ...(studentEmail ? [{ email: studentEmail.toLowerCase().trim() }] : [])
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        registered: false,
        message: 'প্রোফাইল তৈরি করা নেই। অনুগ্রহ করে নিবন্ধন করুন।'
      });
    }

    return res.status(200).json({
      success: true,
      registered: true,
      student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'শিক্ষার্থী লগইন ত্রুটি।'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    if (req.admin) {
      return res.status(200).json({
        success: true,
        user: req.admin,
        role: req.admin.role
      });
    }
    if (req.student) {
      return res.status(200).json({
        success: true,
        user: req.student,
        role: 'student'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'ব্যবহারকারী পাওয়া যায়নি।'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  ensureSuperAdminForFirstUser,
  adminFirebaseLogin,
  adminPasswordLogin,
  unifiedLogin,
  postUnifiedLogin,
  getMeUnified,
  updateStudentProfileSelf,
  studentRegister,
  studentFirebaseLogin,
  getMe
};
