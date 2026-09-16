import express from 'express';
import {
  adminFirebaseLogin,
  adminPasswordLogin,
  unifiedLogin,
  postUnifiedLogin,
  getMeUnified,
  updateStudentProfileSelf,
  studentRegister,
  studentFirebaseLogin,
  getMe
} from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/me-unified', getMeUnified);
router.get('/student/me', getMeUnified);
router.post('/unified-login', postUnifiedLogin);
router.put('/student/profile', updateStudentProfileSelf);

router.post('/admin/firebase-login', adminFirebaseLogin);
router.post('/admin/login', adminPasswordLogin);
router.post('/login', unifiedLogin);
router.post('/student/register', studentRegister);
router.post('/student/login', studentFirebaseLogin);
router.get('/me', authenticateAdmin, getMe);

export default router;
