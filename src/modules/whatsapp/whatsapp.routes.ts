import { Router } from 'express';
import { initSession, sessionStatus, sendMsg, receiveMsg } from './whatsapp.controller';

const router = Router();

router.post('/session/init', initSession);
router.get('/session/:sessionId/status', sessionStatus);
router.post('/send', sendMsg);
router.post('/receive', receiveMsg);

export default router;
