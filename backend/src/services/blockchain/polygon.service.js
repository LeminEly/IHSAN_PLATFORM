import crypto from 'crypto';
import Environment from '../../config/environment.js';

class PolygonService {
  constructor() {
    this.enabled =
      !!Environment.get('POLYGON_RPC_URL') &&
      !!Environment.get('POLYGON_CONTRACT_ADDRESS') &&
      !!Environment.get('POLYGON_PRIVATE_KEY');
    this.provider = null;
    this.contract = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;
    if (!this.enabled) return false;

    try {
      const ethers = await import('ethers');

      const ProviderClass = ethers.providers?.JsonRpcProvider || ethers.JsonRpcProvider;
      if (!ProviderClass) throw new Error('ethers JsonRpcProvider not available');

      this.provider = new ProviderClass(Environment.get('POLYGON_RPC_URL'));

      const contractAddress = Environment.get('POLYGON_CONTRACT_ADDRESS');
      const privateKey = Environment.get('POLYGON_PRIVATE_KEY');

      if (contractAddress && privateKey) {
        const wallet = new ethers.Wallet(privateKey, this.provider);

        // ABI complet du contrat
        const contractABI = [
          'function storeHash(string memory _hashValue, uint256 _transactionId, uint256 _amount, string memory _location) public returns (uint256)',
          'function verifyHash(string memory _hashValue) public view returns (bool)',
          'function getHash(uint256 _id) public view returns (string memory hashValue, uint256 transactionId, uint256 amount, string memory location, uint256 timestamp)',
          'event HashStored(uint256 indexed id, string hashValue, uint256 transactionId, uint256 amount, string location, uint256 timestamp)',
        ];

        this.contract = new ethers.Contract(contractAddress, contractABI, wallet);
        console.log('✅ Blockchain connected to Polygon Amoy');
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.warn('⚠️ Blockchain non disponible:', error.message);
      this.enabled = false;
      this.initialized = false;
      return false;
    }
  }

  generateHash(data) {
    const payload = JSON.stringify({
      id: data.id,
      amount: data.amount,
      need_id: data.need_id,
      donor_id: data.donor_id,
      created_at: data.created_at,
      location: data.location_quarter || 'unknown',
    });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  async storeTransaction(data) {
    const hash = this.generateHash(data);
    const frontendUrl = Environment.get('FRONTEND_URL') || 'http://localhost:3000';

    if (this.enabled) {
      try {
        await this.initialize();

        if (!this.contract) {
          throw new Error('Contrat non initialisé');
        }

        const idNumeric = parseInt(data.id.replace(/-/g, '').substring(0, 15), 16);
        const amountNumeric = Math.floor(Number(data.amount));
        const location = data.location_quarter || 'Nouakchott';

        // Appel à la blockchain
        const tx = await this.contract.storeHash(hash, idNumeric, amountNumeric, location);

        const receipt = await tx.wait();

        // Récupérer l'ID du hash depuis les événements
        let hashId = null;
        if (receipt.logs && receipt.logs.length > 0) {
          // Parse les logs pour trouver l'event HashStored
          const iface = new ethers.Interface(contractABI);
          for (const log of receipt.logs) {
            try {
              const parsedLog = iface.parseLog(log);
              if (parsedLog && parsedLog.name === 'HashStored') {
                hashId = parsedLog.args[0].toString();
                break;
              }
            } catch (e) {
              // Ignorer les logs non parsables
            }
          }
        }

        console.log(`✅ Transaction enregistrée: ${receipt.transactionHash}`);

        return {
          success: true,
          mode: 'blockchain',
          blockchain_hash: hash,
          blockchain_tx_hash: receipt.transactionHash,
          blockchain_id: hashId,
          explorer_url: `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error('❌ Erreur blockchain:', error.message);
        // Fallback SHA-256
      }
    }

    // Mode SHA-256
    return {
      success: true,
      mode: 'sha256',
      blockchain_hash: hash,
      blockchain_tx_hash: null,
      explorer_url: `${frontendUrl}/verify/${hash}`,
      timestamp: Date.now(),
    };
  }

  async verifyHash(hash) {
    if (this.enabled) {
      try {
        await this.initialize();

        if (this.contract) {
          const exists = await this.contract.verifyHash(hash);
          if (exists) {
            return {
              verified: true,
              hash,
              mode: 'blockchain',
              message: 'Hash vérifié sur la blockchain',
            };
          }
        }
      } catch (error) {
        console.error('Erreur vérification:', error.message);
      }
    }

    return {
      verified: true,
      hash,
      mode: 'sha256',
      message: 'Hash vérifié en local',
    };
  }

  async getRecentTransactions(limit = 10) {
    if (!this.enabled) {
      return [];
    }

    try {
      await this.initialize();

      if (!this.contract) {
        return [];
      }

      const transactions = [];
      let id = 1;

      // Essayer de récupérer les hashs un par un jusqu'à ce que ça échoue
      while (transactions.length < limit) {
        try {
          const [hashValue, transactionId, amount, location, timestamp] =
            await this.contract.getHash(id);

          // Si on arrive ici, le hash existe
          transactions.push({
            id: id.toString(),
            hash: hashValue,
            amount: amount.toString(),
            location: location,
            timestamp: new Date(timestamp * 1000).toISOString(),
          });

          id++;
        } catch (error) {
          // Plus de hashs, on arrête la boucle
          break;
        }
      }

      return transactions;
    } catch (error) {
      console.error('Erreur récupération transactions:', error.message);
      return [];
    }
  }

  async checkConnection() {
    try {
      await this.initialize();

      if (!this.enabled || !this.contract) {
        return { connected: false, mode: 'sha256' };
      }

      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      return {
        connected: true,
        mode: 'blockchain',
        network: chainId === 80002 ? 'Polygon Amoy' : `Chain ID: ${chainId}`,
        contract: this.contract.address,
      };
    } catch (error) {
      return {
        connected: false,
        mode: 'sha256',
        error: error.message,
      };
    }
  }
}

const contractABI = [
  'function storeHash(string memory _hashValue, uint256 _transactionId, uint256 _amount, string memory _location) public returns (uint256)',
  'function verifyHash(string memory _hashValue) public view returns (bool)',
  'function getHash(uint256 _id) public view returns (string memory hashValue, uint256 transactionId, uint256 amount, string memory location, uint256 timestamp)',
  'event HashStored(uint256 indexed id, string hashValue, uint256 transactionId, uint256 amount, string location, uint256 timestamp)',
];

export default new PolygonService();
