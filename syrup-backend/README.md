# Syrup Backend API

A production-ready backend implementation of the **Syrup API Standard (SAS) v1** with a focus on Nigerian e-commerce merchants. Built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Features

- ✅ **SAS v1 Compliant** - Fully implements Syrup API Standard v1
- ✅ **Nigerian Merchants** - Pre-seeded with Jumia, Konga, PayPorte, Slot, and more
- ✅ **Smart Scoring** - ML-based coupon scoring using success rate and usage data
- ✅ **Redis Caching** - Fast response times with intelligent caching
- ✅ **Rate Limiting** - Production-ready rate limiting with Redis backend
- ✅ **Type-Safe** - Full TypeScript support with Prisma ORM
- ✅ **Docker Ready** - One-command setup with Docker Compose

## Quick Start

### 1. Install Dependencies

```bash
cd syrup-backend
npm install
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with Nigerian merchants
npm run seed:nigeria
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Version Information
```
GET /syrup/version
```

### List Coupons
```
GET /syrup/coupons?domain=jumia.com.ng&limit=20&offset=0
```

### Report Valid Coupon
```
POST /syrup/coupons/valid/:id
```

### Report Invalid Coupon
```
POST /syrup/coupons/invalid/:id
```

### List Merchants
```
GET /syrup/merchants
```

## Nigerian Merchants Included

- **Jumia** - jumia.com.ng
- **Konga** - konga.com
- **PayPorte** - payporte.com
- **Slot** - slot.ng
- **Jiji** - jiji.ng
- **Dealdey** - dealdey.com
- **Supermart.ng** - supermart.ng
- **Mall for Africa** - mallforafrica.com

## Configuration

Edit `.env` file to customize:

```env
# Server
PORT=3000
NODE_ENV=development
API_VERSION=1.0.0
PROVIDER_NAME=Autospend-Syrup

# Database
DATABASE_URL="postgresql://syrup:syrup_password@localhost:5432/syrup_db"

# Redis
REDIS_URL="redis://localhost:6379"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# API Security (optional)
API_KEY_REQUIRED=false
VALID_API_KEYS=your-key-1,your-key-2

# Caching
CACHE_COUPONS_TTL=300
CACHE_MERCHANTS_TTL=3600
```

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# View database in Prisma Studio
npm run prisma:studio
```

## Production Deployment

### Using Docker

```bash
# Build the application
docker build -t syrup-backend .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Set `NODE_ENV=production` in `.env`
2. Enable API key authentication:
   ```env
   API_KEY_REQUIRED=true
   VALID_API_KEYS=secure-key-1,secure-key-2
   ```
3. Build and run:
   ```bash
   npm run build
   npm start
   ```

## Integrating with Syrup Extension

Update the extension's backend URL in settings:

1. Open Syrup extension
2. Go to Settings
3. Set Base URL: `http://localhost:3000/syrup`
4. (Optional) Set API Key if enabled
5. Save and test!

## Smart Coupon Scoring

The backend uses an intelligent scoring algorithm that considers:

- **Success Rate**: Percentage of successful validations
- **Confidence Factor**: Weight based on number of reports
- **Usage Bonus**: Frequently used coupons get higher scores
- **Auto-Recalculation**: Scores update after each validation report

Score formula:
```
score = (success_rate * confidence_factor) + usage_bonus
```

## License

MIT License - Built for Autospend with ❤️

## Credits

- Original Syrup Extension: [@Abdallah-Alwarawreh](https://github.com/Abdallah-Alwarawreh/Syrup)
- Reference Backend: [@ImGajeed76](https://github.com/ImGajeed76/discountdb-api)
