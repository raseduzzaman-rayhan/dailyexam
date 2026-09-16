import Setting from '../models/Setting.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'সেটিংস আনতে সমস্যা হয়েছে।'
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, { $set: req.body }, { new: true });
    }

    return res.status(200).json({
      success: true,
      message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।',
      data: settings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'সেটিংস সংরক্ষণে সমস্যা হয়েছে।'
    });
  }
};

export default {
  getSettings,
  updateSettings
};
