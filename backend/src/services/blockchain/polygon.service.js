import { ethers } from 'ethers';
import Environment from '../../config/environment.js';
import { blockchainConfig } from '../../config/blockchain.js';
import { BlockchainInterface } from './interface.js';

const CONTRACT_ABI = [
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
      if (!blockchainConfig.enabled) {
        return;
      }

      this.provider = new ethers.providers.JsonRpcProvider(blockchainConfig.rpcUrl);
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
      const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dataString));

      if (!this.contract) {
        return {
          success: true,
          hash: hash,
          blockchain_tx_hash: '0x' + '0'.repeat(64),
          explorer_url: `https://mumbai.polygonscan.com/tx/${'0'.repeat(64)}`,
          message: 'Mode simulation'
        };
      }

      const tx = await this.contract.storeHash(
        hash,
        parseInt(transactionData.id.replace(/-/g, '').substring(0, 16), 16),
        Math.floor(transactionData.amount),
        transactionData.location_quarter || 'Inconnu'
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === 'HashStored');
      const hashId = event?.args?.id?.toString();

      return {
        success: true,
        hash: hash,
        blockchain_tx_hash: receipt.transactionHash,
        explorer_url: `https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`,
        block_number: receipt.blockNumber,
        hash_id: hashId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Blockchain store error:', error);
      throw new Error('Échec de l\'enregistrement sur la blockchain');
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

      const result = await this.contract.getRecentHashes(count);
      const transactions = [];

      for (let i = 0; i < result.ids.length; i++) {
        transactions.push({
          id: result.ids[i].toString(),
          hash: result.hashValues[i],
          amount: ethers.utils.formatEther(result.amounts[i]),
          location: result.locations[i],
          timestamp: new Date(result.timestamps[i].toNumber() * 1000).toISOString()
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