import { Router } from 'express';
import { createQuery, getAllQueries, updateQueryStatus, deleteQuery } from '../controllers/queryController.js';

const router = Router();

router.post('/', createQuery);
router.get('/', getAllQueries);
router.patch('/:id', updateQueryStatus);
router.delete('/:id', deleteQuery);

export default router;
