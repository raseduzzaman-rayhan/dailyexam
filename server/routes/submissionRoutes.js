import express from 'express';
import {
  submitExam,
  getSubmissionResult,
  getSubmissionSolution,
  getAllSubmissionsAdmin,
  getMySubmissions
} from '../controllers/submissionController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitExam);
router.get('/', authenticateAdmin, getAllSubmissionsAdmin);
router.get('/my/history', getMySubmissions);
router.get('/:id', getSubmissionResult);
router.get('/:id/solution', getSubmissionSolution);

export default router;
