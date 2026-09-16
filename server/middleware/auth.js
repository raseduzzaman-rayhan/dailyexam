import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import { verifyFirebaseOrAppToken } from '../config/firebaseAdmin.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'অনুমোদনহীন অ্যাক্সেস! অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseOrAppToken(token);

    let admin = null;

    if (decoded.id) {
      admin = await Admin.findById(decoded.id);
    }
    if (!admin && decoded.firebaseUid) {
      admin = await Admin.findOne({ firebaseUid: decoded.firebaseUid });
    }
    if (!admin && decoded.email) {
      admin = await Admin.findOne({ email: decoded.email.toLowerCase().trim() });
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'অ্যাডমিন অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।'
      });
    }

    if (admin.status === 'inactive' || admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'আপনার অ্যাডমিন অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে।'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'টোকেন যাচাইকরণ ব্যর্থ হয়েছে।'
    });
  }
};

export const authenticateStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'অনুগ্রহ করে লগইন করুন।'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyFirebaseOrAppToken(token);

    let student = null;
    if (decoded.firebaseUid) {
      student = await Student.findOne({ firebaseUid: decoded.firebaseUid });
    }
    if (!student && decoded.email) {
      student = await Student.findOne({ email: decoded.email.toLowerCase().trim() });
    }

    req.student = student;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'টোকেন যাচাইকরণ ব্যর্থ হয়েছে।'
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'অননুমোদিত অ্যাক্সেস।'
      });
    }

    if (req.admin.role === 'super_admin') {
      return next();
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'এই কাজটি করার জন্য আপনার অনুমতি নেই।'
      });
    }

    next();
  };
};

export default {
  authenticateAdmin,
  authenticateStudent,
  authorizeRoles
};
