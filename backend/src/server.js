import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function startServer() {
  try {
    try {
      await connectDB();
    } catch (dbErr) {
      if (config.isProduction) {
        console.error('❌ [Database] Critical: Could not connect to MongoDB Atlas.');
        console.error('💡 Action Required on Render:');
        console.error('   1. Ensure MONGODB_URI is correctly set in your Render service environment variables.');
        console.error('   2. Verify in MongoDB Atlas > Network Access that 0.0.0.0/0 (Allow access from anywhere) is added.');
        throw dbErr;
      } else {
        console.warn('⚠️  [Database] Local MongoDB is not reachable (127.0.0.1:27017). Continuing server startup so health checks and static routes respond.');
      }
    }

    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🛡️  INKGUARD Brand Governance Platform Backend Running`);
      console.log(`🌐 Server Port: ${config.port}`);
      console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`⚙️  Environment: ${config.nodeEnv}`);
      console.log(`🤖 AI Provider: ${config.geminiApiKey ? 'Gemini' : config.openaiApiKey ? 'OpenAI' : 'None (Deterministic Active)'}`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
}

startServer();

