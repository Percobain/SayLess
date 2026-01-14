import logger from '../utils/logger.js';
import { handleIncomingMessage } from './whatsappHandlers.js';
import twilio from 'twilio';

console.log('[WhatsApp] Bot module loading...');

class WhatsAppBot {
  constructor() {
    console.log('[WhatsApp] Initializing WhatsApp bot...');
    
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || null;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || null;

    logger.info('[WhatsApp] Config check', {
      hasAccountSid: !!this.accountSid,
      hasAuthToken: !!this.authToken,
      whatsappNumber: this.whatsappNumber || 'NOT SET',
    });

    // Twilio REST client for sending WhatsApp messages
    this.client =
      this.accountSid && this.authToken
        ? twilio(this.accountSid, this.authToken)
        : null;

    if (this.client) {
      logger.info('[WhatsApp] ✅ Twilio client initialized successfully');
    } else {
      logger.warn('[WhatsApp] ⚠️ Twilio client NOT initialized (missing credentials)');
    }
  }

  /**
   * Handle incoming Twilio webhook for WhatsApp.
   * Uses Twilio REST API (Messages.create) to send the reply,
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async handleWebhook(req, res) {
    try {
      const params = req.body || {};

      // Basic console log for quick debugging
      logger.info('[WhatsApp] Incoming webhook:', {
        from: params.From,
        bodyPreview: (params.Body || '').substring(0, 80),
      });

      const replyText = await handleIncomingMessage(params);

      // If Twilio client or WhatsApp number is not configured, fallback to TwiML response
      if (!this.client || !this.whatsappNumber) {
        logger.warn('Twilio client or WhatsApp number not configured, using TwiML fallback');
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(replyText);
        return res.type('text/xml').send(twiml.toString());
      }

      const to = params.From; // e.g., 'whatsapp:+9193...'
      
      // Ensure sender number format
      let from = this.whatsappNumber;
      if (!from.startsWith('whatsapp:')) {
          from = `whatsapp:${from}`;
      }

      // Use Twilio REST API to send the WhatsApp message
      // Note: Twilio requires the 'from' number to be the sandbox number or a verified number
      await this.client.messages.create({
        to,
        from,
        body: replyText,
      });

      logger.bot('whatsapp', 'Reply sent via Twilio REST API', {
        to,
        from,
        replyPreview: replyText.substring(0, 120),
      });

      // Acknowledge webhook
      res.status(200).send('OK');
    } catch (error) {
      logger.error('WhatsApp webhook processing error', {
        error: error.message,
        stack: error.stack,
      });

      // On error, still return a basic TwiML to acknowledge the webhook if possible
      try {
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(
          '❌ Sorry, something went wrong while processing your request.',
        );
        res.type('text/xml').send(twiml.toString());
      } catch {
        res.status(200).send('OK');
      }
    }
  }
}

// Export singleton instance
const whatsappBotInstance = new WhatsAppBot();
export default whatsappBotInstance;
