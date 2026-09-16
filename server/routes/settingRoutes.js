import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { authenticateAdmin, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', authenticateAdmin, authorizeRoles('super_admin'), updateSettings);

export default router;
