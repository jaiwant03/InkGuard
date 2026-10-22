import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inkguard',
  jwtSecret: process.env.JWT_SECRET || 'inkguard_dev_secret_key_change_in_prod_12345',
  cookieSecret: process.env.COOKIE_SECRET || 'inkguard_cookie_secret_key_54321',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};
