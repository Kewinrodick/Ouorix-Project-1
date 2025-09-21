const express = require('express');
const Web3 = require('web3');
const Tourist = require('../models/Tourist');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize Web3 (this would connect to actual blockchain in production)
const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');

// Smart contract ABI and address (simplified for demo)
const contractABI = [
  {
    "inputs": [{"type": "string", "name": "digitalId"}, {"type": "string", "name": "data"}],
    "name": "storeData",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [{"type": "string", "name": "digitalId"}],
    "name": "getData",
    "outputs": [{"type": "string"}],
    "type": "function"
  }
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';

// Create blockchain wallet for tourist
router.post('/create-wallet', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'tourist') {
      return res.status(403).json({ error: 'Only tourists can create wallets' });
    }
    
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    // Create new wallet
    const account = web3.eth.accounts.create();
    
    // Store wallet address (private key should be securely managed)
    tourist.blockchainData.walletAddress = account.address;
    tourist.blockchainData.verificationStatus = true;
    
    await tourist.save();
    
    res.json({
      message: 'Blockchain wallet created successfully',
      walletAddress: account.address,
      publicKey: account.address // In production, handle private key securely
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Store tourist data on blockchain
router.post('/store-data', authenticateToken, async (req, res) => {
  try {
    const { dataType, encryptedData } = req.body;
    
    const tourist = await Tourist.findById(req.user.id);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    if (!tourist.blockchainData.walletAddress) {
      return res.status(400).json({ error: 'No blockchain wallet found. Create wallet first.' });
    }
    
    // Simulate blockchain transaction
    const transactionHash = generateTransactionHash();
    const blockNumber = Math.floor(Math.random() * 1000000);
    
    // Store transaction reference
    tourist.blockchainData.transactionHistory.push(transactionHash);
    await tourist.save();
    
    res.json({
      message: 'Data stored on blockchain successfully',
      transactionHash,
      blockNumber,
      dataType,
      gasUsed: Math.floor(Math.random() * 50000) + 21000
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve data from blockchain
router.get('/get-data/:digitalId', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority' && req.user.digitalId !== req.params.digitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const tourist = await Tourist.findOne({ digitalId: req.params.digitalId });
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    // Simulate blockchain data retrieval
    const blockchainData = {
      digitalId: tourist.digitalId,
      walletAddress: tourist.blockchainData.walletAddress,
      verificationStatus: tourist.blockchainData.verificationStatus,
      transactionCount: tourist.blockchainData.transactionHistory.length,
      lastTransaction: tourist.blockchainData.transactionHistory[tourist.blockchainData.transactionHistory.length - 1],
      // In production, retrieve actual encrypted data from blockchain
      encryptedData: generateMockEncryptedData()
    };
    
    res.json({
      message: 'Data retrieved from blockchain',
      data: blockchainData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify tourist identity using blockchain
router.post('/verify-identity', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority') {
      return res.status(403).json({ error: 'Only authorities can verify identities' });
    }
    
    const { digitalId, signature } = req.body;
    
    const tourist = await Tourist.findOne({ digitalId });
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    if (!tourist.blockchainData.walletAddress) {
      return res.status(400).json({ error: 'Tourist has no blockchain wallet' });
    }
    
    // Simulate signature verification
    const isValidSignature = verifySignature(digitalId, signature, tourist.blockchainData.walletAddress);
    
    if (isValidSignature) {
      tourist.blockchainData.verificationStatus = true;
      await tourist.save();
      
      res.json({
        message: 'Identity verified successfully',
        verified: true,
        walletAddress: tourist.blockchainData.walletAddress,
        verificationTime: new Date()
      });
    } else {
      res.status(400).json({
        error: 'Identity verification failed',
        verified: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain transaction history
router.get('/transactions/:digitalId', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'authority' && req.user.digitalId !== req.params.digitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const tourist = await Tourist.findOne({ digitalId: req.params.digitalId });
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    // Simulate transaction details retrieval
    const transactions = tourist.blockchainData.transactionHistory.map((hash, index) => ({
      hash,
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date(Date.now() - index * 60 * 60 * 1000), // Mock timestamps
      type: ['store_data', 'verify_identity', 'update_location'][Math.floor(Math.random() * 3)],
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      status: 'confirmed'
    }));
    
    res.json({
      digitalId: req.params.digitalId,
      walletAddress: tourist.blockchainData.walletAddress,
      totalTransactions: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smart contract interaction for emergency protocols
router.post('/emergency-protocol', authenticateToken, async (req, res) => {
  try {
    const { digitalId, emergencyType, location } = req.body;
    
    // Simulate smart contract call for emergency protocol
    const contractInstance = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
    
    // Prepare emergency data
    const emergencyData = JSON.stringify({
      digitalId,
      emergencyType,
      location,
      timestamp: new Date(),
      reportedBy: req.user.digitalId || req.user.badgeNumber
    });
    
    const transactionHash = generateTransactionHash();
    
    res.json({
      message: 'Emergency protocol activated on blockchain',
      transactionHash,
      emergencyData: {
        digitalId,
        emergencyType,
        timestamp: new Date(),
        protocolStatus: 'activated'
      },
      smartContractAddress: CONTRACT_ADDRESS
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blockchain network status
router.get('/network-status', authenticateToken, async (req, res) => {
  try {
    // Simulate blockchain network status
    const networkStatus = {
      networkId: process.env.NETWORK_ID || '1337',
      blockHeight: Math.floor(Math.random() * 1000000),
      gasPrice: Math.floor(Math.random() * 20) + 10, // Gwei
      peers: Math.floor(Math.random() * 50) + 10,
      status: 'connected',
      lastBlockTime: new Date(Date.now() - Math.random() * 60000),
      averageBlockTime: '15 seconds'
    };
    
    res.json(networkStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function generateTransactionHash() {
  return '0x' + Math.random().toString(16).slice(2, 66).padStart(64, '0');
}

function generateMockEncryptedData() {
  return {
    personalData: 'encrypted_personal_data_hash',
    locationData: 'encrypted_location_data_hash',
    emergencyContacts: 'encrypted_emergency_contacts_hash',
    medicalInfo: 'encrypted_medical_info_hash'
  };
}

function verifySignature(message, signature, address) {
  // Simulate signature verification
  // In production, use actual cryptographic verification
  return signature && signature.length > 10;
}

module.exports = router;