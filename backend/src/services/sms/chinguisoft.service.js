import axios from 'axios';
import Environment from '../../config/environment.js';
import { SMSInterface } from './interface.js';

class ChinguisoftService extends SMSInterface {
    constructor() {
        super();
        this.validationKey = Environment.get('CHINGUIS_VALIDATION_KEY');
        this.token = Environment.get('CHINGUIS_VALIDATION_TOKEN');
        this.appName = Environment.get('SMS_APP_NAME') || 'IHSAN';
        this.baseUrl = `https://chinguisoft.com/api/sms/validation/${this.validationKey}`;
    }

    /**
     * Chinguisoft requires 8 digits (Mauritania local format)
     * Starts with 2, 3, or 4
     */
    formatPhoneNumber(phone) {
        if (!phone) return '';
        let cleaned = phone.toString().replace(/\D/g, '');

        // If it has country code 222, remove it
        if (cleaned.startsWith('222')) {
            cleaned = cleaned.substring(3);
        }

        // Chinguisoft specific check
        if (cleaned.length !== 8) {
            console.warn(`[Chinguisoft] Phone format warning: ${phone} -> ${cleaned} is not 8 digits.`);
        }

        return cleaned;
    }

    /**
     * Send a verification code using Chinguisoft Validation API
     */
    async sendVerificationCode(phoneNumber, lang = 'fr') {
        try {
            const payload = {
                phone: this.formatPhoneNumber(phoneNumber),
                lang: lang === 'ar' ? 'ar' : 'fr'
            };

            console.log(`[Chinguisoft] Sending validation SMS to ${payload.phone} (lang: ${payload.lang})`);

            const response = await axios.post(
                this.baseUrl,
                payload,
                {
                    headers: {
                        'Validation-token': this.token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                code: response.data.code,
                balance: response.data.balance
            };
        } catch (error) {
            const errorData = error.response?.data;
            console.error('[Chinguisoft] API Error:', errorData || error.message);

            return {
                success: false,
                error: errorData?.error || 'SMS_SERVICE_UNAVAILABLE',
                details: errorData?.errors || null
            };
        }
    }

    /**
     * Note: The Chinguisoft Validation API is specialized for codes.
     * For custom notifications, it will send a validation code by default.
     * If custom templates are needed, contact Chinguisoft to enable them on your account.
     */
    async _sendGeneric(phone, type) {
        console.log(`[Chinguisoft] Notification triggered: ${type} for ${phone}`);
        // We reuse the validation API for now as it's the only one provided.
        // In a real pro setup, you'd use a custom SMS endpoint for these.
        return this.sendVerificationCode(phone);
    }

    async notifyValidatorDelivery(validatorPhone, needTitle, amount) {
        return this._sendGeneric(validatorPhone, 'DONATION_MADE');
    }

    async notifyDonorDelivery(donorPhone, needTitle, receiptNumber) {
        return this._sendGeneric(donorPhone, 'DELIVERY_CONFIRMED');
    }

    async notifyPartnerNewNeed(partnerPhone, needTitle, amount, quarter) {
        return this._sendGeneric(partnerPhone, 'NEW_NEED');
    }

    async notifyPartnerPayment(partnerPhone, needTitle, amount, donorPhone) {
        return this._sendGeneric(partnerPhone, 'PAYMENT_RECEIVED');
    }

    async notifyAccountApproved(phone, role) {
        return this._sendGeneric(phone, 'ACCOUNT_APPROVED');
    }

    async notifyAccountRejected(phone, role, reason) {
        return this._sendGeneric(phone, 'ACCOUNT_REJECTED');
    }

    async sendWelcomeMessage(phone, role) {
        return this._sendGeneric(phone, 'WELCOME');
    }
}

export default new ChinguisoftService();
