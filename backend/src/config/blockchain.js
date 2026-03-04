import Environment from './environment.js';

export const blockchainConfig = {
  rpcUrl: Environment.get('POLYGON_RPC_URL'),
  privateKey: Environment.get('POLYGON_PRIVATE_KEY'),
  contractAddress: Environment.get('POLYGON_CONTRACT_ADDRESS'),
  enabled: !!Environment.get('POLYGON_RPC_URL')
};