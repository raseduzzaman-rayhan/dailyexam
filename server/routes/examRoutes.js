import express from 'express';
import {
  getAllExamsAdmin,
  getPublicExams,
  getPublicExamBySlug,
  getExamByIdAdmin,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  duplicateExam,
  getExamLeaderboard,
  previewQuestionSelection,
  regenerateSelection,
  validateSelectionEndpoint
} from '../controllers/examController.js';
import { authenticateAdmin, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicExams);
router.get('/public/:slug', getPublicExamBySlug);
router.get('/:slug/leaderboard', getExamLeaderboard);

// Admin smart selection routes
router.post('/preview-selection', authenticateAdmin, previewQuestionSelection);
router.post('/regenerate-selection', authenticateAdmin, regenerateSelection);
router.post('/validate-selection', authenticateAdmin, validateSelectionEndpoint);

// Admin exam CRUD routes
router.get('/', authenticateAdmin, getAllExamsAdmin);
router.get('/:id', authenticateAdmin, getExamByIdAdmin);
router.post('/', authenticateAdmin, authorizeRoles('super_admin', 'admin', 'content_editor', 'editor'), createExam);
router.put('/:id', authenticateAdmin, authorizeRoles('super_admin', 'admin', 'content_editor', 'editor'), updateExam);
router.patch('/:id/publish', authenticateAdmin, authorizeRoles('super_admin', 'admin', 'content_editor', 'editor'), publishExam);
router.post('/:id/duplicate', authenticateAdmin, authorizeRoles('super_admin', 'admin', 'content_editor', 'editor'), duplicateExam);
router.delete('/:id', authenticateAdmin, authorizeRoles('super_admin', 'admin'), deleteExam);

export default router;
