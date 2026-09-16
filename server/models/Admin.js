import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      sparse: true,
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
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'content_editor', 'editor'],
      default: 'admin'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export default Admin;
