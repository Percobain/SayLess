## SayLess Protocol (Project VEIL) — Anonymous Crime Reporting, Built to Scale

**WhatsApp-first · Session-based · End-to-end encrypted · Tamper-evident on-chain**

SayLess Protocol helps citizens report crimes **without exposing their identity**, while still creating a **verifiable, tamper-evident evidence trail** that authorities (and a jury layer) can use to prioritize and validate reports.

It’s designed for the real world: **WhatsApp as the entry point** (mass reach, no new app), **custodial embedded wallets** (no seed phrases), and **modern cryptography** (NaCl) so privacy is the default.

### Links (Deployed)
- **Frontend (primary)**: `https://say-less.xyz/`
- **Frontend (alternate / preview)**: `https://sayless.vercel.app/`
- **Backend API (Render)**: `https://sayless-tovy.onrender.com` (health: `/` and `/health`)
- **Pitch deck (Canva)**: `https://www.canva.com/design/DAG-epb3j_g/Do4kRPKpqe_ox4aJewb9EA/view?utm_content=DAG-epb3j_g&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hb3d4e5f2cd`

---

### Problem (Why this exists)
Many crimes go unreported because reporting can be personally risky:
- **Fear of exposure / retaliation**
- **Distrust in centralized systems** (leaks, censorship, silent edits, or data loss)
- **Friction** (apps, logins, long forms, unclear next steps)

### Solution (What SayLess changes)
SayLess Protocol makes reporting:
- **Private by default**: your report is **encrypted in the browser before upload**
- **Hard to tamper with**: a **content proof** is anchored on-chain
- **Scalable**: starts on **WhatsApp** (no installs)
- **Accountable without doxxing**: incentives, penalties, and reputation discourage abuse
- **Actionable**: Gemini-assisted triage + a jury voting layer helps prioritize and validate cases

---

## User Flow (WhatsApp → Web → On-chain → Review)
1. **WhatsApp**: user sends `REPORT`
2. Backend creates a **24h session** and replies with a secure link: `/r/<SESSION>`
3. **Web app**: user submits details + optional media
4. **Client-side encryption (NaCl)** happens **before** upload
5. Backend pins encrypted payload to **IPFS (Pinata)** → returns CID
6. Backend anchors \(keccak256(CID)\) + \(keccak256(sessionId)\) on **Ethereum Sepolia**
7. **Authority dashboard** decrypts (authority key), runs AI + evidence checks, then verifies/rejects
8. Rewards, penalties, and reputation are applied (on-chain rewards + DB reputation + jury weighting)

---

## Architecture (High-level)
```
Citizen (WhatsApp)
  -> Twilio Webhook (/webhook/twilio)
  -> Session created (MongoDB) + Privy wallet provisioned
  -> Link sent: FRONTEND_URL/r/<SESSION>

Citizen (Web App)
  -> NaCl encryption in browser (tweetnacl: secretbox + box)
  -> Encrypted JSON + encrypted media -> Backend API (/api/report)

Backend (Express)
  -> Pinata IPFS (CID)
  -> Hash CID + SessionId (keccak256)
  -> Ethereum Sepolia: submitReport(cidHash, sessionHash, reporterWallet)

Authorities / Jury (Web App)
  -> Fetch encrypted payload from IPFS
  -> Decrypt using AUTHORITY_PRIVATE_KEY
  -> Gemini report analysis + Gemini Vision checks for evidence validity
  -> Verify / Reject (+ reputation + rewards)
```

---

## Why WhatsApp (Scale, adoption, safety)
- **Massive reach**: works where users already are
- **Zero install**: no new app, no storage burden
- **Low onboarding friction**: “text REPORT → get secure link”
- **Works for low-tech + high-risk situations**: familiar UX + minimal steps

> Note: we **do not rely on WhatsApp’s E2E** for privacy. The report is **encrypted in the browser** before it ever hits our backend/IPFS.

---

## Security & Privacy Model (What we guarantee)
### End-to-end encryption (NaCl / tweetnacl)
In the client (`client/src/lib/encryption.js`) we:
- Encrypt the report + files using **NaCl secretbox** (XSalsa20-Poly1305) with a random symmetric key
- Encrypt that symmetric key to the authority using **NaCl box** with an **ephemeral keypair** + the **authority public key**

Result:
- Backend and IPFS only ever see **ciphertext**
- Only the authority holding `AUTHORITY_PRIVATE_KEY` can decrypt

### Why NaCl here (judge-friendly explanation)
- **DES is insecure** and not suitable for modern security.
- **AES can be safe**, but in real apps it’s often misused (modes, IVs/nonces, padding, key management).
- **NaCl is “hard to misuse”**: modern primitives, sane defaults, and fewer foot-guns for end-to-end encryption flows like this.

### Tamper-evidence (On-chain + IPFS)
- Encrypted payload is pinned to IPFS (CID is content-addressed)
- We anchor a **hash of the CID on-chain**
- If anyone changes the content, the CID changes → the on-chain hash no longer matches

### Session-based anonymity
- Reports are initiated using a **short-lived session** (24h)
- Phone number is **hashed** server-side and **never** written on-chain

---

## Incentives, Penalties, and Reputation (Anti-spam / Trust)
SayLess discourages abuse without forcing identity disclosure:
- **Reputation score** grows with verified contributions and falls with rejected/abusive behavior
- **Jury voting** is **weighted by reputation** (higher-trust voters count more)
- **Rewards** are distributed for verified reports (ETH rewards pool)

> In this MVP, some anti-spam “stake” accounting is tracked in the backend UI/logic (ex: per-report stake estimates). In production, stake/deposit + slashing should be enforced directly in the smart contract with strict access control.

---

## AI Layer (Gemini + Evidence Validation)
Used to reduce workload and improve credibility:
- **Gemini report analysis**: category, urgency, credibility, suggested action
- **Web context** (Tavily) can be used to cross-check claims
- **Gemini Vision evidence checks**:
  - flags obvious stock photos / watermarked images / unrelated media
  - attempts to detect AI-generated imagery

---

## Smart Contract (Deployed)
### Network
- **Ethereum Sepolia Testnet**
- **Chain ID**: `11155111`

### Contract Addresses
- **SayLess contract**: `0x371D1e299E1D5a4B72fD3D561CE7A0B57069394f`
- **Deployer**: `0x71AfE44200A819171a0687b1026E8d4424472Ff8`

Deployment metadata is stored in `contracts/deployment.json`.

### What’s stored on-chain vs off-chain
- **On-chain**: hashes (CID hash, session hash), status, rewards, reputation values (contract)
- **Off-chain**: encrypted payload itself (IPFS), case workflow, jury votes & detailed reputation history (MongoDB)

### Important MVP note (access control)
Current contract functions (verify/reject/claim) are **not access-controlled** (prototype). In production, these must be gated with `Ownable`/`AccessControl` and role-based permissions (Authority/Jury/Protocol).

---

## API & Routes (Backend)
Base URL (local): `http://localhost:3000`  
Base URL (deployed): `https://sayless-tovy.onrender.com`

### Core
- `POST /webhook/twilio` — Twilio WhatsApp webhook
- `GET /api/session/:id` — validate session (pending + not expired)
- `POST /api/report` — submit encrypted report (pins to IPFS + anchors on-chain)

### Authority
- `GET /api/authority/reports`
- `POST /api/authority/decrypt/:id`
- `POST /api/authority/verify/:id`
- `POST /api/authority/reject/:id`

### Jury
- `GET /api/jury/cases`
- `POST /api/jury/vote/:reportId`
- `GET /api/jury/stats/:walletAddress`

### Reporter / Wallet
- `POST /api/reporter/session`
- `GET /api/reporter/stats/:walletAddress`
- `GET /api/reporter/wallet/:walletAddress`
- `POST /api/reporter/claim-rewards`

---

## WhatsApp Commands
| Command | What it does |
|---|---|
| `REPORT` | Create an anonymous session + get a secure report link |
| `STATUS <id>` | Check report status |
| `BALANCE` / `BAL` | View wallet balance + pending rewards |
| `REWARDS` | Show rewards + reputation |
| `CLAIM` | Claim on-chain rewards |
| `WA` | Show wallet address + Etherscan link |
| `TX` / `TXS` | Show transaction history |
| `SEED` | Fund wallet with Sepolia ETH (if funder configured) |
| `EXPORT` | Show Privy wallet info |
| `HELP` | List commands |

---

## Repo Structure
```
contracts/   # Hardhat + Solidity contract + deployment metadata
server/      # Express API, Twilio webhook, IPFS pinning, blockchain + Privy + AI services
client/      # React (Vite) frontend: reporter flow, authority dashboard, jury dashboard
```

---

## Local Setup (Full Stack)
### Prerequisites
- Node.js 18+ (recommended)
- MongoDB (local or Atlas)
- Twilio WhatsApp sandbox or approved WhatsApp sender
- Pinata API keys
- Sepolia RPC + funded deployer wallet
- (Optional) Privy App credentials for embedded wallet provisioning
- (Optional) Gemini + Tavily keys for AI + web context

### 1) Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile

# Deploy (optional; contract is already deployed on Sepolia)
npx hardhat run scripts/deploy.js --network sepolia
```

Required `contracts/.env`:
- `PRIVATE_KEY` (deployer key without 0x)
- `ETHERSCAN_API_KEY` (optional)

### 2) Backend (server)
```bash
cd server
npm install

# Generate authority keypair (save in env)
node generateKeys.js

npm run dev
```

Create `server/.env` (minimum):
- `PORT=3000`
- `MONGODB_URI=...`
- `FRONTEND_URL=http://localhost:5173` (or `https://say-less.xyz`)
- `PHONE_SALT=...`
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_WHATSAPP_NUMBER=...`
- `PINATA_API_KEY=...`
- `PINATA_SECRET_KEY=...`
- `SEPOLIA_RPC_URL=...`
- `CONTRACT_ADDRESS=0x371D1e299E1D5a4B72fD3D561CE7A0B57069394f`
- `DEPLOYER_PRIVATE_KEY=...` (0x-prefixed private key used by backend signer)
- `AUTHORITY_PRIVATE_KEY=...` (base64 NaCl secret key)

Optional (recommended for full experience):
- `GEMINI_API_KEY=...`
- `TAVILY_API_KEY=...`
- `PRIVY_APP_ID=...`
- `PRIVY_APP_SECRET=...`
- `FUNDER_PRIVATE_KEY=...` (used to seed user wallets with Sepolia ETH)

### 3) Frontend (client)
```bash
cd client
npm install
npm run dev
```

Create `client/.env`:
- `VITE_API_URL=http://localhost:3000` (or `https://sayless-tovy.onrender.com`)
- `VITE_AUTHORITY_PUBLIC_KEY=...` (base64 NaCl public key)
- `VITE_GEMINI_API_KEY=...` (optional: client-side translation features)

---

## Twilio / WhatsApp Setup
1. In Twilio console, configure the incoming WhatsApp webhook to:
   - `POST <YOUR_BACKEND_URL>/webhook/twilio`
2. Ensure `TWILIO_WHATSAPP_NUMBER` matches your Twilio sender number.
3. Set `FRONTEND_URL` so the bot sends users to your deployed frontend.

---

## Demo Script (for judging)
1. WhatsApp: send `REPORT`
2. Open the link → fill report → attach evidence → submit
3. Show “receipt”: IPFS CID + on-chain TX hash (tamper-evident proof)
4. Authority dashboard: decrypt → view Gemini analysis + evidence checks
5. Jury dashboard: cast votes (weighted)
6. Verify a report → show reward becomes claimable → claim via WhatsApp

---

## License
MIT
