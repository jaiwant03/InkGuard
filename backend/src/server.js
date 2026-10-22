import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function startServer() {
  try {
    await connectDB();

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
