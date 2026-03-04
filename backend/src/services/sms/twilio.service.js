import twilio from 'twilio';
import Environment from '../../config/environment.js';
import { SMSInterface } from './interface.js';
import { SMS_TEMPLATES } from '../../utils/constants.js';

class TwilioService extends SMSInterface {
  constructor() {
    super();
    this.client = twilio(
      Environment.get('TWILIO_ACCOUNT_SID'),
      Environment.get('TWILIO_AUTH_TOKEN')
    );
    this.fromNumber = Environment.get('TWILIO_PHONE_NUMBER');
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('222')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 8) {
        cleaned = '+222' + cleaned;
      } else {
        cleaned = '+222' + cleaned.replace(/^0+/, '');
      }
    }
    return cleaned;
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(phoneNumber) {
    try {
      const code = this.generateCode();
      const message = await this.client.messages.create({
        body: SMS_TEMPLATES.VERIFICATION.replace('{code}', code),
        from: this.fromNumber,
        to: this.formatPhoneNumber(phoneNumber)
      });
      return { success: true, code, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      throw new Error('Échec de l\'envoi du SMS');
    }
  }

  async notifyValidatorDelivery(validatorPhone, needTitle, amount) {
    try {
      const message = await this.client.messages.create({
        body: SMS_TEMPLATES.DONATION_MADE.replace('{amount}', amount).replace('{title}', needTitle),
        from: this.fromNumber,
        to: this.formatPhoneNumber(validatorPhone)
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      return { success: false };
    }
  }

  async notifyDonorDelivery(donorPhone, needTitle, receiptNumber) {
    try {
      const message = await this.client.messages.create({
        body: SMS_TEMPLATES.DELIVERY_CONFIRMED.replace('{title}', needTitle).replace('{receipt}', receiptNumber),
        from: this.fromNumber,
        to: this.formatPhoneNumber(donorPhone)
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      return { success: false };
    }
  }

  async notifyPartnerNewNeed(partnerPhone, needTitle, amount, quarter) {
    try {
      const message = await this.client.messages.create({
        body: SMS_TEMPLATES.NEW_NEED.replace('{title}', needTitle).replace('{amount}', amount).replace('{quarter}', quarter),
        from: this.fromNumber,
        to: this.formatPhoneNumber(partnerPhone)
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      return { success: false };
    }
  }

  async notifyPartnerPayment(partnerPhone, needTitle, amount, donorPhone) {
    try {
      const message = await this.client.messages.create({
        body: SMS_TEMPLATES.PAYMENT_RECEIVED.replace('{amount}', amount).replace('{title}', needTitle),
        from: this.fromNumber,
        to: this.formatPhoneNumber(partnerPhone)
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      return { success: false };
    }
  }

  async notifyAccountApproved(phone, role) {
    try {
      const roleText = role === 'validator' ? 'validateur' : 'partenaire';
      const message = await this.client.messages.create({
        body: SMS_TEMPLATES.ACCOUNT_APPROVED.replace('{role}', roleText),
        from: this.fromNumber,
        to: this.formatPhoneNumber(phone)
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      return { success: false };
    }
  }

  async notifyAccountRejected(phone, role, reason) {
    try {
      const roleText = role === 'validator' ? 'validateur' : 'partenaire';
      const message = await this.client.messages.create({
        body: SMS_TEMPLATES.ACCOUNT_REJECTED.replace('{role}', roleText).replace('{reason}', reason),
        from: this.fromNumber,
        to: this.formatPhoneNumber(phone)
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      return { success: false };
    }
  }

  async sendWelcomeMessage(phone, role) {
    try {
      const templates = {
        donor: SMS_TEMPLATES.WELCOME_DONOR,
        validator: SMS_TEMPLATES.WELCOME_VALIDATOR,
        partner: SMS_TEMPLATES.WELCOME_PARTNER
      };
      const message = await this.client.messages.create({
        body: templates[role] || templates.donor,
        from: this.fromNumber,
        to: this.formatPhoneNumber(phone)
      });
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Twilio error:', error);
      return { success: false };
    }
  }
}

export default new TwilioService();