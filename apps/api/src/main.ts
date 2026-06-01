import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

// BigInt cannot be serialized by JSON.stringify — convert to number for API responses.
// Monetary values use BigInt in Prisma (IRR amounts fit in Number safely up to 2^53).
(BigInt.prototype as any).toJSON = function () { return Number(this); };
import * as compression from 'compression';
import helmet from 'helmet';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/compression.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['log', 'debug', 'error', 'warn'],
  });

  // ── Security ──────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // handled by nginx
    crossOriginEmbedderPolicy: false,
  }));

  // ── Compression ───────────────────────────────────────────────
  app.use(compression({
    level: 6,
    threshold: 1024, // only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  }));

  // ── CORS ──────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
    methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Request-ID'],
  });

  // ── Global prefix ─────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global pipes ──────────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    stopAtFirstError: true,
  }));

  // ── Global interceptors ───────────────────────────────────────
  app.useGlobalInterceptors(
    new PerformanceInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // ── Graceful shutdown ─────────────────────────────────────────
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 API running on http://0.0.0.0:${port}/api`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});


// ── Health check ──────────────────────────────────────────────
// Added in Phase 11 for Docker HEALTHCHECK + load balancer
