export class BlockchainInterface {
  async storeTransaction(transactionData) {
    throw new Error('Method not implemented');
  }

  async verifyHash(hash) {
    throw new Error('Method not implemented');
  }

  async getRecentTransactions(count) {
    throw new Error('Method not implemented');
  }
}
