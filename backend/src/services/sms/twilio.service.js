import twilio from 'twilio';
import Environment from '../../config/environment.js';

class TwilioService {
  constructor() {
    this.client = twilio(
      Environment.get('TWILIO_ACCOUNT_SID'),
      Environment.get('TWILIO_AUTH_TOKEN')
    );
    this.fromNumber = Environment.get('TWILIO_PHONE_NUMBER');
  }

  async sendVerificationCode(phoneNumber, code) {
    try {
      const message = await this.client.messages.create({
        body: `IHSAN: Votre code de vérification est ${code}. Valable 10 minutes.`,
        from: this.fromNumber,
        to: this.formatPhoneNumber(phoneNumber)
      });

      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error) {
      console.error('Twilio error:', error);
      throw new Error('Échec de l\'envoi du SMS');
    }
  }

  formatPhoneNumber(phone) {
    if (!phone.startsWith('+')) {
      return `+222${phone}`;
    }
    return phone;
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default new TwilioService();