import express from 'express';
import { getDashboardAnalytics, getQuestionsAnalytics } from '../controllers/analyticsController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateAdmin);

router.get('/', getDashboardAnalytics);
router.get('/dashboard', getDashboardAnalytics);
router.get('/questions', getQuestionsAnalytics);

export default router;
