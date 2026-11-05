import 'dotenv/config';
import app from './app.js';
import { prisma } from './utils/prisma.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 FitTrack API Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n[${signal}] Received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
