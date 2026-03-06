import sgMail from '@sendgrid/mail';
import Environment from '../../config/environment.js';

class EmailService {
  constructor() {
    sgMail.setApiKey(Environment.get('SENDGRID_API_KEY'));
    this.fromEmail = Environment.get('SENDGRID_FROM_EMAIL');
  }

  async sendVerificationEmail(email, code) {
    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Vérification IHSAN',
      html: `<h1>Bienvenue sur IHSAN</h1><p>Votre code de vérification est : <strong>${code}</strong></p>`,
    };
    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Email error:', error);
      throw new Error("Échec de l'envoi de l'email");
    }
  }

  async sendReceipt(email, transaction) {
    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Confirmation de votre don IHSAN',
      html: `<h1>Merci pour votre générosité</h1><p>Votre don de ${transaction.amount} MRU a été enregistré.</p><p>Numéro de reçu : ${transaction.receiptNumber}</p>`,
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Email error:', error);
    }
  }
}

export default new EmailService();
