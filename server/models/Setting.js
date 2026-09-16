import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: 'Online MCQ Exam Platform'
    },
    logoUrl: {
      type: String,
      default: ''
    },
    primaryContact: {
      type: String,
      default: ''
    },
    whatsappNumber: {
      type: String,
      default: ''
    },
    defaultExamDuration: {
      type: Number,
      default: 20
    },
    defaultPassingPercentage: {
      type: Number,
      default: 50
    },
    leaderboardDefault: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export default Setting;
