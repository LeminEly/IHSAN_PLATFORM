import crypto from 'crypto';

export class HashGenerator {
  static generateSHA256(data) {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  static generateReceiptNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `IHSAN-${timestamp}-${random}`;
  }
}