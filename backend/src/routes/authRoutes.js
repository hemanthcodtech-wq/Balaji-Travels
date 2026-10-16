import { Router } from 'express';
import { loginAdmin, updateAdminCredentials } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginAdmin);
router.post('/update-credentials', updateAdminCredentials);

export default router;
