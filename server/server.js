require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import services
const { initBlockchain } = require('./services/blockchain');
const { initGemini } = require('./services/gemini');
const { initPrivy, getFunderBalance } = require('./services/privy');

// Import routes
const webhookRoutes = require('./routes/webhook');
const reportRoutes = require('./routes/report');
const authorityRoutes = require('./routes/authority');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/webhook', webhookRoutes);
app.use('/api', reportRoutes);
app.use('/api/authority', authorityRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SayLess API',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize services and start server
async function start() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    
    // Initialize blockchain service (now async)
    console.log('Initializing blockchain service...');
    await initBlockchain();
    
    // Initialize Privy wallet service (now async)
    console.log('Initializing Privy wallet service...');
    await initPrivy();
    
    // Check funder balance
    try {
      const funderBalance = await getFunderBalance();
      console.log(`Funder wallet balance: ${funderBalance} ETH`);
    } catch (e) {
      console.log('Could not check funder balance:', e.message);
    }
    
    // Initialize Gemini AI
    console.log('Initializing Gemini AI...');
    initGemini();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`SayLess Server Running`);
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`========================================\n`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
