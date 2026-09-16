import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'অ্যাডমিনদের তালিকা লোড করা যায়নি।'
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'নাম ও ইমেইল আবশ্যক।'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।'
      });
    }

    let hashedPassword = '';
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newAdmin = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'admin',
      status: 'active',
      isActive: true
    });

    const adminObj = newAdmin.toObject();
    delete adminObj.password;

    return res.status(201).json({
      success: true,
      message: 'নতুন অ্যাডমিন সফলভাবে তৈরি হয়েছে।',
      data: adminObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'অ্যাডমিন তৈরি ব্যর্থ হয়েছে।'
    });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status, isActive, password } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'অ্যাডমিন খুঁজে পাওয়া যায়নি।'
      });
    }

    if (name) admin.name = name;
    if (role) admin.role = role;
    if (status) admin.status = status;
    if (isActive !== undefined) admin.isActive = isActive;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    const adminObj = admin.toObject();
    delete adminObj.password;

    return res.status(200).json({
      success: true,
      message: 'অ্যাডমিনের তথ্য সফলভাবে আপডেট হয়েছে।',
      data: adminObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'অ্যাডমিন আপডেট ব্যর্থ হয়েছে।'
    });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'অ্যাডমিন খুঁজে পাওয়া যায়নি।'
      });
    }

    if (admin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'সিস্টেমে অন্তত একজন সুপার অ্যাডমিন থাকা আবশ্যক।'
        });
      }
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'অ্যাডমিন অ্যাকাউন্টটি মুছে ফেলা হয়েছে।'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'অ্যাডমিন মুছতে সমস্যা হয়েছে।'
    });
  }
};

export default {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
};
