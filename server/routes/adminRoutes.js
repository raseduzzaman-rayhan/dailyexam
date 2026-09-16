import express from 'express';
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminController.js';
import { authenticateAdmin, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateAdmin);
router.use(authorizeRoles('super_admin'));

router.get('/', getAllAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

export default router;
