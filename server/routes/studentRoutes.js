import express from 'express';
import {
  getAllStudentsAdmin,
  getStudentByFirebaseUid,
  updateStudentProfile,
  deleteStudent
} from '../controllers/studentController.js';
import { getStudentHistory } from '../controllers/submissionController.js';
import { authenticateAdmin, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/:identifier/history', getStudentHistory);
router.get('/profile/:uid', getStudentByFirebaseUid);
router.put('/profile/:uid', updateStudentProfile);

router.get('/', authenticateAdmin, getAllStudentsAdmin);
router.delete('/:id', authenticateAdmin, authorizeRoles('super_admin', 'admin'), deleteStudent);

export default router;
