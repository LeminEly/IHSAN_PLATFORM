import Environment from './environment.js';

export const blockchainConfig = {
  rpcUrl: Environment.get('POLYGON_RPC_URL'),
  privateKey: Environment.get('POLYGON_PRIVATE_KEY'),
  contractAddress: Environment.get('POLYGON_CONTRACT_ADDRESS'),
  explorerUrl: Environment.get('POLYGON_EXPLORER_URL') || 'https://polygonscan.com/tx/',
  enabled: !!Environment.get('POLYGON_RPC_URL')
};