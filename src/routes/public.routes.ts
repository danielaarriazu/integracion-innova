import { Router } from 'express';
import { getFAQsPublicas } from '../controllers/public.controller';
import { addPublicConsultationMessage, createPublicConsultation, updatePublicConsultationContact } from '../controllers/consultation.controller';
import { validate } from '../middlewares/validator.middleware';
import { addConsultationMessageSchema, consultationParamsSchema, createConsultationSchema, updatePublicContactSchema } from '../schema/consultation.schema';

const router = Router();

// Endpoint público: /api/public/chatbot/:slug/faqs
router.get('/chatbot/:slug/faqs', getFAQsPublicas);
router.post('/chatbot/:slug/consultations', validate(createConsultationSchema), createPublicConsultation);
router.post('/chatbot/:slug/consultations/:id/messages', validate(consultationParamsSchema, 'params'), validate(addConsultationMessageSchema), addPublicConsultationMessage);
router.patch('/chatbot/:slug/consultations/:id/contact', validate(consultationParamsSchema, 'params'), validate(updatePublicContactSchema), updatePublicConsultationContact);

export default router;
