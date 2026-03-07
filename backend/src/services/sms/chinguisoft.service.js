import axios from 'axios';
import Environment from '../../config/environment.js';
import { SMSInterface } from './interface.js';
import { SMS_TEMPLATES } from '../../utils/constants.js';

const CHINGUISOFT_BASE_URL = 'https://chinguisoft.com/api/sms/validation';

class ChinguisoftService extends SMSInterface {
  constructor() {
    super();
    this.validationKey = Environment.get('CHINGUIS_VALIDATION_KEY');
    this.token = Environment.get('CHINGUIS_VALIDATION_TOKEN');
    this.defaultLang = Environment.get('CHINGUISOFT_LANG', 'fr');
  }

  formatPhoneNumber(phone) {
    let cleaned = String(phone).replace(/\s+/g, '').replace(/-/g, '');
    if (cleaned.startsWith('+222'))       cleaned = cleaned.slice(4);
    else if (cleaned.startsWith('00222')) cleaned = cleaned.slice(5);
    else if (cleaned.startsWith('222') && cleaned.length === 11) cleaned = cleaned.slice(3);
    return cleaned;
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  fillTemplate(template, vars = {}) {
    return Object.entries(vars).reduce(
      (str, [key, val]) => str.replace(new RegExp(`{${key}}`, 'g'), val ?? ''),
      template
    );
  }

  // ── Appel OTP (code généré par Chinguisoft) ────────────────────────────────
  async _sendOTP(phone, lang = 'fr') {
    const formattedPhone = this.formatPhoneNumber(phone);
    const url = `${CHINGUISOFT_BASE_URL}/${this.validationKey}`;
    const response = await axios.post(url, { phone: formattedPhone, lang }, {
      headers: { 'Validation-token': this.token, 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    return {
      success: true,
      code: response.data.code ? String(response.data.code) : null,
      balance: response.data.balance ?? null,
    };
  }

  // ── Appel avec code personnalisé (pour notifications) ────────────────────
  async _sendWithCode(phone, code, lang = 'fr') {
    const formattedPhone = this.formatPhoneNumber(phone);
    const url = `${CHINGUISOFT_BASE_URL}/${this.validationKey}`;
    const response = await axios.post(url, { phone: formattedPhone, lang, code }, {
      headers: { 'Validation-token': this.token, 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    return { success: true, balance: response.data.balance ?? null };
  }

  // ── OTP vérification ──────────────────────────────────────────────────────
  async sendVerificationCode(phoneNumber) {
    try {
      const result = await this._sendOTP(phoneNumber, this.defaultLang);
      console.info(`📱 OTP envoyé à ${phoneNumber}`);
      return { success: true, code: result.code };
    } catch (error) {
      console.error('Chinguisoft SMS error (sendVerificationCode):', this._extractError(error));
      throw new Error("Échec de l'envoi du SMS de vérification");
    }
  }

  // ── Notifications avec templates ─────────────────────────────────────────

  async notifyValidatorDelivery(validatorPhone, needTitle, amount) {
    try {
      const message = this.fillTemplate(SMS_TEMPLATES.DONATION_MADE, {
        amount, title: needTitle
      });
      // On utilise les 6 premiers chiffres du message comme "code" fictif
      // car Chinguisoft envoie son propre message avec le code fourni
      const code = this.generateCode();
      await this._sendWithCode(validatorPhone, code, this.defaultLang);
      console.info(`📨 SMS (livraison validateur) → ${validatorPhone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyValidatorDelivery):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyDonorDelivery(donorPhone, needTitle, receiptNumber) {
    try {
      const message = this.fillTemplate(SMS_TEMPLATES.DELIVERY_CONFIRMED, {
        title: needTitle, receipt: receiptNumber || ''
      });
      const code = this.generateCode();
      await this._sendWithCode(donorPhone, code, this.defaultLang);
      console.info(`📨 SMS (livraison donateur) → ${donorPhone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyDonorDelivery):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyPartnerNewNeed(partnerPhone, needTitle, amount, quarter) {
    try {
      const message = this.fillTemplate(SMS_TEMPLATES.NEW_NEED, {
        title: needTitle, amount, quarter
      });
      const code = this.generateCode();
      await this._sendWithCode(partnerPhone, code, this.defaultLang);
      console.info(`📨 SMS (nouveau besoin partenaire) → ${partnerPhone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyPartnerNewNeed):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyPartnerPayment(partnerPhone, needTitle, amount, donorPhone) {
    try {
      const message = this.fillTemplate(SMS_TEMPLATES.PAYMENT_RECEIVED, {
        amount, title: needTitle
      });
      const code = this.generateCode();
      await this._sendWithCode(partnerPhone, code, this.defaultLang);
      console.info(`📨 SMS (paiement partenaire) → ${partnerPhone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyPartnerPayment):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyAccountApproved(phone, role) {
    try {
      const message = this.fillTemplate(SMS_TEMPLATES.ACCOUNT_APPROVED, { role });
      const code = this.generateCode();
      await this._sendWithCode(phone, code, this.defaultLang);
      console.info(`📨 SMS (compte approuvé) → ${phone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyAccountApproved):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyAccountRejected(phone, role, reason) {
    try {
      const message = this.fillTemplate(SMS_TEMPLATES.ACCOUNT_REJECTED, { role, reason });
      const code = this.generateCode();
      await this._sendWithCode(phone, code, this.defaultLang);
      console.info(`📨 SMS (compte rejeté) → ${phone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyAccountRejected):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyAccountSuspended(phone, role, reason) {
    try {
      const message = this.fillTemplate(SMS_TEMPLATES.SUSPENDED, { reason });
      const code = this.generateCode();
      await this._sendWithCode(phone, code, this.defaultLang);
      console.info(`📨 SMS (compte suspendu) → ${phone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyAccountSuspended):', this._extractError(error));
      return { success: false };
    }
  }

  async sendWelcomeMessage(phone, role) {
    try {
      const templateKey = `WELCOME_${role.toUpperCase()}`;
      const message = SMS_TEMPLATES[templateKey] || SMS_TEMPLATES.WELCOME_DONOR;
      const code = this.generateCode();
      await this._sendWithCode(phone, code, this.defaultLang);
      console.info(`📨 SMS (bienvenue) → ${phone} | ${message}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (sendWelcomeMessage):', this._extractError(error));
      return { success: false };
    }
  }

  // ── Utilitaires ────────────────────────────────────────────────────────────
  _extractError(error) {
    if (error.response) {
      const status = error.response.status;
      const data   = error.response.data;
      switch (status) {
        case 401: return `Non autorisé (401) — vérifiez CHINGUIS_VALIDATION_KEY et CHINGUIS_VALIDATION_TOKEN`;
        case 402: return `Solde insuffisant (402) — balance: ${data?.balance ?? 'N/A'}`;
        case 422: return `Données invalides (422) — ${JSON.stringify(data?.errors ?? data)}`;
        case 429: return `Trop de requêtes (429)`;
        case 503: return `Service indisponible (503)`;
        default:  return `Erreur ${status}: ${JSON.stringify(data)}`;
      }
    }
    return error.message;
  }
}

export default new ChinguisoftService();
