# Demo Credit - Wallet Service

A mobile lending wallet service API built with NodeJS, TypeScript, KnexJS, and MySQL.

## Live URL
https://demo-credit-i8zh.onrender.com

## GitHub Repository
https://github.com/iarneja/demo-credit

## Features
- User account creation with Karma blacklist check
- Wallet funding
- Wallet-to-wallet transfers
- Wallet withdrawals
- JWT-based authentication

## Tech Stack
- NodeJS (v24)
- TypeScript
- ExpressJS
- KnexJS ORM
- MySQL
- Jest (unit testing)

## Architecture Decisions

### Why KnexJS?
KnexJS provides a clean query builder that works well with MySQL while allowing raw SQL when needed. It also has excellent migration support which keeps the database schema version-controlled.

### Why JWT Authentication?
The assessment required a faux token-based authentication system. JWT is stateless, simple to implement, and sufficient for this MVP scope.

### Transaction Scoping
All fund transfers and withdrawals use database transactions to ensure atomicity. If any step fails, the entire operation rolls back — preventing partial state corruption.

### Karma Blacklist
Every new user registration is checked against the Lendsqr Adjutor Karma blacklist API before account creation. Blacklisted users are rejected immediately.

## E-R Diagram

```
USERS
─────────────────────
id (PK, INT, AUTO)
name (VARCHAR)
email (VARCHAR, UNIQUE)
password (VARCHAR)
created_at
updated_at
     │
     │ 1:1
     ▼
WALLETS
─────────────────────
id (PK, INT, AUTO)
user_id (FK → users.id)
balance (DECIMAL 15,2)
created_at
updated_at
     │
     │ 1:N
     ▼
TRANSACTIONS
─────────────────────
id (PK, INT, AUTO)
wallet_id (FK → wallets.id)
type (ENUM: fund/transfer/withdraw)
amount (DECIMAL 15,2)
related_wallet_id (INT, NULLABLE)
status (ENUM: success/failed)
created_at
updated_at
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new user account |
| POST | /api/auth/login | Login and get JWT token |

### Wallet (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/wallet/fund | Fund wallet |
| POST | /api/wallet/transfer | Transfer to another user |
| POST | /api/wallet/withdraw | Withdraw from wallet |
| GET | /api/wallet/balance | Get wallet balance |

## Sample Requests

### Register
```bash
curl -X POST https://demo-credit-i8zh.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST https://demo-credit-i8zh.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Fund Wallet
```bash
curl -X POST https://demo-credit-i8zh.onrender.com/api/wallet/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":5000}'
```

### Transfer
```bash
curl -X POST https://demo-credit-i8zh.onrender.com/api/wallet/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverEmail":"jane@example.com","amount":1000}'
```

### Withdraw
```bash
curl -X POST https://demo-credit-i8zh.onrender.com/api/wallet/withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":500}'
```

## Setup & Installation

```bash
# Clone the repo
git clone https://github.com/iarneja/demo-credit.git
cd demo-credit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DB credentials and API keys

# Run migrations
npm run migrate

# Start development server
npm run dev

# Run tests
npm test
```

## Environment Variables
```
PORT=3000
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=demo_credit
JWT_SECRET=your_jwt_secret
ADJUTOR_API_KEY=your_adjutor_api_key
ADJUTOR_BASE_URL=https://adjutor.lendsqr.com/v2
```

## Running Tests
```bash
npm test
```
Tests cover both positive and negative scenarios for auth and wallet endpoints.