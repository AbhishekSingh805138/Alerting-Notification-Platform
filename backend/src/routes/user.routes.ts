import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const controller = new UserController();

router.get('/users/:userId/alerts', controller.getAlerts);
router.patch('/users/:userId/alerts/:alertId/read-state', controller.setAlertReadState);
router.post('/users/:userId/alerts/:alertId/snooze', controller.snoozeAlert);

export default router;
