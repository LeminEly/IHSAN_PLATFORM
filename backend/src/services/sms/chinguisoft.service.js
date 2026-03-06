import axios from 'axios';
import Environment from '../../config/environment.js';
import { SMSInterface } from './interface.js';

const CHINGUISOFT_BASE_URL = 'https://chinguisoft.com/api/sms/validation';

class ChinguisoftService extends SMSInterface {
  constructor() {
    super();
    this.validationKey = Environment.get('CHINGUIS_VALIDATION_KEY');
    this.token = Environment.get('CHINGUIS_VALIDATION_TOKEN');
    this.defaultLang = Environment.get('CHINGUISOFT_LANG', 'fr');
  }

  /**
   * Formate un numéro mauritanien en 8 chiffres (sans préfixe international).
   * Chinguisoft attend un numéro commençant par 2, 3 ou 4 sur 8 chiffres.
   */
  formatPhoneNumber(phone) {
    let cleaned = String(phone).replace(/\s+/g, '').replace(/-/g, '');
    // Supprimer le préfixe international mauritanien si présent
    if (cleaned.startsWith('+222')) {
      cleaned = cleaned.slice(4);
    } else if (cleaned.startsWith('00222')) {
      cleaned = cleaned.slice(5);
    } else if (cleaned.startsWith('222') && cleaned.length === 11) {
      cleaned = cleaned.slice(3);
    }
    return cleaned;
  }

  /**
   * Génère un code OTP aléatoire à 6 chiffres.
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Appel principal à l'API Chinguisoft.
   * @param {string} phone - Numéro à 8 chiffres
   * @param {string} lang - 'ar' | 'fr'
   * @param {string|null} code - Code OTP (optionnel, généré par l'API si absent)
   * @returns {{ success: boolean, code: string|null, balance: number|null }}
   */
  async _send(phone, lang = 'fr', code = null) {
    const formattedPhone = this.formatPhoneNumber(phone);
    const url = `${CHINGUISOFT_BASE_URL}/${this.validationKey}`;

    const body = { phone: formattedPhone, lang };
    if (code) body.code = code;

    const response = await axios.post(url, body, {
      headers: {
        'Validation-token': this.token,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Succès 200 : { code: 654321, balance: 95 }
    return {
      success: true,
      code: response.data.code ? String(response.data.code) : code,
      balance: response.data.balance ?? null
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OTP : vérification de numéro de téléphone
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Envoie un code OTP de vérification.
   * Le code est généré par l'API Chinguisoft et retourné dans la réponse.
   */
  async sendVerificationCode(phoneNumber) {
    try {
      const result = await this._send(phoneNumber, this.defaultLang);
      return { success: true, code: result.code };
    } catch (error) {
      console.error('Chinguisoft SMS error (sendVerificationCode):', this._extractError(error));
      throw new Error("Échec de l'envoi du SMS de vérification");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Notifications (approuvé, rejeté, livraison, paiement…)
  // L'API Chinguisoft envoie son message standard avec le code fourni.
  // L'utilisateur reçoit un SMS signalant une activité sur son compte.
  // ─────────────────────────────────────────────────────────────────────────

  async notifyValidatorDelivery(validatorPhone, needTitle, amount) {
    try {
      const code = this.generateCode();
      await this._send(validatorPhone, this.defaultLang, code);
      console.info(`📨 SMS notification (livraison validateur) envoyée à ${validatorPhone} — besoin: ${needTitle}, montant: ${amount} MRU`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyValidatorDelivery):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyDonorDelivery(donorPhone, needTitle) {
    try {
      const code = this.generateCode();
      await this._send(donorPhone, this.defaultLang, code);
      console.info(`📨 SMS notification (livraison donateur) envoyée à ${donorPhone} — besoin: ${needTitle}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyDonorDelivery):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyPartnerNewNeed(partnerPhone, needTitle, amount, quarter) {
    try {
      const code = this.generateCode();
      await this._send(partnerPhone, this.defaultLang, code);
      console.info(`📨 SMS notification (nouveau besoin partenaire) envoyée à ${partnerPhone} — ${needTitle}, ${amount} MRU, quartier ${quarter}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyPartnerNewNeed):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyPartnerPayment(partnerPhone, needTitle, amount, donorPhone) {
    try {
      const code = this.generateCode();
      await this._send(partnerPhone, this.defaultLang, code);
      console.info(`📨 SMS notification (paiement partenaire) envoyée à ${partnerPhone} — ${needTitle}, ${amount} MRU, donateur: ${donorPhone}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyPartnerPayment):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyAccountApproved(phone, role) {
    try {
      const code = this.generateCode();
      await this._send(phone, this.defaultLang, code);
      console.info(`📨 SMS notification (compte approuvé) envoyée à ${phone} — rôle: ${role}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyAccountApproved):', this._extractError(error));
      return { success: false };
    }
  }

  async notifyAccountRejected(phone, role, reason) {
    try {
      const code = this.generateCode();
      await this._send(phone, this.defaultLang, code);
      console.info(`📨 SMS notification (compte rejeté) envoyée à ${phone} — rôle: ${role}, raison: ${reason}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (notifyAccountRejected):', this._extractError(error));
      return { success: false };
    }
  }

  async sendWelcomeMessage(phone, role) {
    try {
      const code = this.generateCode();
      await this._send(phone, this.defaultLang, code);
      console.info(`📨 SMS notification (bienvenue) envoyée à ${phone} — rôle: ${role}`);
      return { success: true };
    } catch (error) {
      console.error('Chinguisoft SMS error (sendWelcomeMessage):', this._extractError(error));
      return { success: false };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilitaires
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Extrait un message d'erreur lisible depuis l'erreur axios.
   */
  _extractError(error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      switch (status) {
        case 401: return `Non autorisé (401) — vérifiez CHINGUIS_VALIDATION_KEY et CHINGUIS_VALIDATION_TOKEN`;
        case 402: return `Solde insuffisant (402) — balance: ${data?.balance ?? 'N/A'}`;
        case 422: return `Données invalides (422) — ${JSON.stringify(data?.errors ?? data)}`;
        case 429: return `Trop de requêtes (429) — ralentissez`;
        case 503: return `Service indisponible (503) — réessayez plus tard`;
        default: return `Erreur ${status}: ${JSON.stringify(data)}`;
      }
    }
    return error.message;
  }
}

export default new ChinguisoftService();