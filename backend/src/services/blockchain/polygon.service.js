import { ethers } from 'ethers';
import Environment from '../../config/environment.js';
import { blockchainConfig } from '../../config/blockchain.js';
import { BlockchainInterface } from './interface.js';

const CONTRACT_ABI = [
  "event HashStored(uint256 indexed id, string hashValue, uint256 transactionId, uint256 amount, string location, uint256 timestamp)",
  "function storeHash(string memory _hashValue, uint256 _transactionId, uint256 _amount, string memory _location) public returns (uint256)",
  "function verifyHash(string memory _hashValue) public view returns (bool)",
  "function getHash(uint256 _id) public view returns (string memory hashValue, uint256 transactionId, uint256 amount, string memory location, uint256 timestamp)",
  "function getRecentHashes(uint256 _count) public view returns (uint256[] memory ids, string[] memory hashValues, uint256[] memory amounts, string[] memory locations, uint256[] memory timestamps)"
];

class PolygonService extends BlockchainInterface {
  constructor() {
    super();
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (!blockchainConfig.enabled || this.initialized) {
        return;
      }

      this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
      this.wallet = new ethers.Wallet(blockchainConfig.privateKey, this.provider);

      if (blockchainConfig.contractAddress) {
        this.contract = new ethers.Contract(
          blockchainConfig.contractAddress,
          CONTRACT_ABI,
          this.wallet
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error('Blockchain init error:', error);
    }
  }

  async storeTransaction(transactionData) {
    try {
      await this.initialize();

      const dataString = JSON.stringify(transactionData);
      const hash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

      if (!this.contract) {
        return {
          success: true,
          hash: hash,
          blockchain_tx_hash: '0x' + '0'.repeat(64),
          explorer_url: `${blockchainConfig.explorerUrl}${'0'.repeat(64)}`,
          message: 'Mode simulation'
        };
      }

      // Convert UUID-like ID to a BigInt for the contract
      const txIdNumeric = BigInt('0x' + transactionData.id.replace(/-/g, '').substring(0, 16));

      const tx = await this.contract.storeHash(
        hash,
        txIdNumeric,
        BigInt(Math.floor(transactionData.amount)),
        transactionData.location_quarter || 'Inconnu'
      );

      const receipt = await tx.wait();

      // ethers v6: logs are accessible on the receipt
      // To get specific event data, we'd use the contract interface to parse logs
      const hashId = receipt.blockNumber.toString(); // Simplified for now

      return {
        success: true,
        hash: hash,
        blockchain_tx_hash: receipt.hash,
        explorer_url: `${blockchainConfig.explorerUrl}${receipt.hash}`,
        block_number: receipt.blockNumber,
        hash_id: hashId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Blockchain store error:', error);
      // Don't throw to allow platform to work even if blockchain fails
      return { success: false, error: error.message };
    }
  }

  async verifyHash(hash) {
    try {
      await this.initialize();

      if (!this.contract) {
        return { verified: true, message: 'Mode simulation' };
      }

      const exists = await this.contract.verifyHash(hash);
      return {
        verified: exists,
        message: exists ? 'Hash vérifié' : 'Hash non trouvé'
      };
    } catch (error) {
      console.error('Blockchain verify error:', error);
      return { verified: false, error: error.message };
    }
  }

  async getRecentTransactions(count = 20) {
    try {
      await this.initialize();

      if (!this.contract) {
        return [];
      }

      const result = await this.contract.getRecentHashes(BigInt(count));
      const transactions = [];

      for (let i = 0; i < result.ids.length; i++) {
        transactions.push({
          id: result.ids[i].toString(),
          hash: result.hashValues[i],
          amount: result.amounts[i].toString(),
          location: result.locations[i],
          timestamp: new Date(Number(result.timestamps[i]) * 1000).toISOString()
        });
      }

      return transactions;
    } catch (error) {
      console.error('Blockchain get recent error:', error);
      return [];
    }
  }
}

export default new PolygonService();