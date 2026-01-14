const express = require('express');
const router = express.Router();
const whatsappBot = require('../services/whatsappBot');

// POST /webhook/twilio - Handle WhatsApp/SMS messages
router.post('/twilio', (req, res) => {
  whatsappBot.handleWebhook(req, res);
});

module.exports = router;
