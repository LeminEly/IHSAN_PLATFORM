export class SMSInterface {
  async sendVerificationCode(phoneNumber) {
    throw new Error('Method not implemented');
  }

  async notifyValidatorDelivery(validatorPhone, needTitle, amount) {
    throw new Error('Method not implemented');
  }

  async notifyDonorDelivery(donorPhone, needTitle, receiptNumber) {
    throw new Error('Method not implemented');
  }

  async notifyPartnerNewNeed(partnerPhone, needTitle, amount, quarter) {
    throw new Error('Method not implemented');
  }

  async notifyPartnerPayment(partnerPhone, needTitle, amount, donorPhone) {
    throw new Error('Method not implemented');
  }

  async notifyAccountApproved(phone, role) {
    throw new Error('Method not implemented');
  }

  async notifyAccountRejected(phone, role, reason) {
    throw new Error('Method not implemented');
  }

  async sendWelcomeMessage(phone, role) {
    throw new Error('Method not implemented');
  }
}