import { Router } from 'express';
import {
  initiatePayment,
  handleEasebuzzCallback,
  getAllPayments,
} from '../controllers/paymentController.js';

const router = Router();

router.post('/initiate', initiatePayment);
router.post('/callback', handleEasebuzzCallback);
router.get('/', getAllPayments);

export default router;
