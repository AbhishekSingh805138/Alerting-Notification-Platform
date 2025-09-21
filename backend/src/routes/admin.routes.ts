import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';

const router = Router();
const controller = new AdminController();

router.post('/alerts', controller.createAlert);
router.put('/alerts/:id', controller.updateAlert);
router.get('/alerts', controller.listAlerts);
router.post('/reminders/trigger', controller.triggerReminders);
router.get('/analytics', controller.analytics);

export default router;


