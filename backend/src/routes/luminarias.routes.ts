import { Router } from 'express';
import * as ctrl from '../controllers/luminarias.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', ctrl.getAll);
router.get('/stats', ctrl.getStats);
router.get('/:id', ctrl.getById);
router.post('/', verifyToken, ctrl.create);
router.put('/:id', verifyToken, ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);

export default router;
