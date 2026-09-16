import express from 'express';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  getSubjectsAndCategories,
  getAvailabilitySummary
} from '../controllers/questionController.js';
import { authenticateAdmin, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/meta/filters', authenticateAdmin, getSubjectsAndCategories);
router.get('/meta/availability-summary', authenticateAdmin, getAvailabilitySummary);
router.get('/', authenticateAdmin, getAllQuestions);
router.get('/:id', authenticateAdmin, getQuestionById);
router.post('/', authenticateAdmin, authorizeRoles('super_admin', 'admin', 'content_editor', 'editor'), createQuestion);
router.post('/:id/duplicate', authenticateAdmin, authorizeRoles('super_admin', 'admin', 'content_editor', 'editor'), duplicateQuestion);
router.put('/:id', authenticateAdmin, authorizeRoles('super_admin', 'admin', 'content_editor', 'editor'), updateQuestion);
router.delete('/:id', authenticateAdmin, authorizeRoles('super_admin', 'admin'), deleteQuestion);

export default router;
