import { Router } from 'express';
import * as ctrl from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, ctrl.listUsers);
router.get('/:uid', verifyToken, ctrl.getUser);
router.put('/:uid', verifyToken, ctrl.updateUser);
router.delete('/:uid', verifyToken, ctrl.deleteUser);

export default router;
