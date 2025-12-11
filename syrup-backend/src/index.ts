import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import routes from './routes';
import { rateLimiter, addRateLimitHeaders } from './middleware/rateLimiter';
import { apiKeyAuth } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Compression and parsing
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (only in development)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(rateLimiter);
app.use(addRateLimitHeaders);

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
  });
});

// API routes with authentication
app.use('/syrup', apiKeyAuth, routes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🍯 Syrup Backend API v${config.apiVersion}                 ║
║                                                       ║
║   Provider: ${config.providerName.padEnd(36)}║
║   Environment: ${config.nodeEnv.padEnd(33)}║
║   Port: ${config.port.toString().padEnd(41)}║
║                                                       ║
║   Endpoints:                                          ║
║   - GET  /health                                      ║
║   - GET  /syrup/version                               ║
║   - GET  /syrup/coupons?domain=example.com            ║
║   - POST /syrup/coupons/valid/:id                     ║
║   - POST /syrup/coupons/invalid/:id                   ║
║   - GET  /syrup/merchants                             ║
║                                                       ║
║   Server running at http://localhost:${config.port}          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
