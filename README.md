# SayLess - Anonymous Crime Reporting Protocol

WhatsApp-Initiated · Web-Encrypted · Blockchain-Verified

## Overview

SayLess enables anonymous, encrypted crime reporting via WhatsApp triggers. Reports are encrypted in the browser before transmission, stored on IPFS, and verified on Ethereum Sepolia blockchain.

## Architecture

```
User (WhatsApp)
    ↓ sends "REPORT"
Twilio Webhook
    ↓ creates sessionId
Reply with secure link → https://sayless.app/r/<sessionId>
User opens link in browser
Browser → Client-side encryption (NaCl/tweetnacl)
Encrypted blob → Backend API
Backend → Pinata IPFS (CID)
Backend → compute cidHash = keccak256(CID)
Backend → call SayLess.submitReport(cidHash)
Contract emits event → txHash
Authority Dashboard → retrieves IPFS blob → decrypts → review → validate/reject
```

## Tech Stack

- **Smart Contracts**: Solidity, Hardhat, Sepolia
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React (Vite), Tailwind CSS
- **Messaging**: Twilio (WhatsApp/SMS)
- **Storage**: Pinata IPFS
- **Encryption**: NaCl (tweetnacl)
- **AI**: Google Gemini (content filtering)

## Deployed Contract

- **Network**: Sepolia
- **Address**: `0x371D1e299E1D5a4B72fD3D561CE7A0B57069394f`

## Quick Start

### 1. Smart Contracts (already deployed)

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Backend

```bash
cd server
npm install

# Generate authority keypair
node generateKeys.js

# Update .env with your keys
# Then start server
npm run dev
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - Twilio credentials
- `PINATA_API_KEY`, `PINATA_SECRET_KEY` - Pinata IPFS keys
- `CONTRACT_ADDRESS` - Deployed contract address
- `DEPLOYER_PRIVATE_KEY` - Wallet private key for transactions
- `AUTHORITY_PRIVATE_KEY` - NaCl secret key for decryption
- `GEMINI_API_KEY` - Google Gemini API key (optional)

### 3. Frontend

```bash
cd client
npm install

# Update .env with VITE_AUTHORITY_PUBLIC_KEY
npm run dev
```

## WhatsApp Commands

| Command | Description |
|---------|-------------|
| `REPORT` | Create anonymous report session |
| `STATUS <id>` | Check report status |
| `BALANCE` | View wallet balance |
| `REWARDS` | View pending rewards |
| `CLAIM` | Claim your rewards |
| `EXPORT` | Export wallet private key |
| `HELP` | Show all commands |

## User Flow

1. **Text "REPORT" on WhatsApp** → Get secure one-time link
2. **Open link in browser** → Write your report
3. **Report is encrypted** → Before leaving your device
4. **Stored on IPFS** → Immutable, decentralized
5. **Verified on blockchain** → Tamper-proof record
6. **Authority reviews** → Decrypt, verify, reward/reject

## Security Model

- ✅ Client-side encryption (NaCl secretbox)
- ✅ Only authority can decrypt
- ✅ No plaintext stored anywhere
- ✅ Phone number never on-chain
- ✅ Immutable blockchain proof
- ❌ WhatsApp E2E not relied upon
- ❌ Platform cannot read reports

## Deployment

### Frontend (Vercel)
```bash
cd client
vercel --prod
```

### Backend (Render)
1. Connect GitHub repo
2. Set environment variables
3. Deploy

## Demo Script

1. Open WhatsApp → text "REPORT" to Twilio number
2. Receive secure link
3. Open link → type report → submit
4. Show encryption happening
5. Open Sepolia explorer → show transaction
6. Open Authority Dashboard → decrypt report
7. Show Gemini AI analysis
8. Click Verify → show reward allocation
9. Text "REWARDS" on WhatsApp → show balance

## One-Line Pitch

> "SayLess enables anonymous, encrypted crime reporting initiated via WhatsApp, with verifiable on-chain integrity and incentive mechanisms — without exposing user identity to authorities."

## License

MIT


