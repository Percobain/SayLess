import express from 'express';
import whatsappBot from '../services/whatsappBot.js';

const router = express.Router();

// POST /webhook/twilio - Handle WhatsApp/SMS messages
router.post('/twilio', (req, res) => {
  whatsappBot.handleWebhook(req, res);
});

export default router;
