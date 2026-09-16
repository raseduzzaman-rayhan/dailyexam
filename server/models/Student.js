import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    photoURL: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      division: { type: String, default: '' },
      district: { type: String, default: '' },
      upazila: { type: String, default: '' }
    },
    education: {
      level: { type: String, default: '' },
      institution: { type: String, default: '' },
      subject: { type: String, default: '' },
      passingYear: { type: String, default: '' }
    },
    role: {
      type: String,
      default: 'student',
      enum: ['student', 'super_admin', 'admin', 'editor', 'content_editor']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export default Student;
