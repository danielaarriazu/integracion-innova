import { Router } from 'express';
import { getFAQsPublicas } from '../controllers/public.controller';

const router = Router();

// Endpoint público: /api/public/chatbot/:slug/faqs
router.get('/chatbot/:slug/faqs', getFAQsPublicas);

export default router;