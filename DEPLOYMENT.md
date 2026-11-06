# 🚀 INKGUARD Production Deployment Guide
## Deploy Frontend to Vercel & Backend to Render

This guide walks you through deploying **INKGUARD** with the backend API hosted on **Render** and the frontend SPA hosted on **Vercel**, backed by **MongoDB Atlas**.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────┐       HTTPS / REST        ┌──────────────────────────────────┐
│         Vercel (Frontend)       │ ────────────────────────> │          Render (Backend)        │
│  https://your-app.vercel.app    │ <──────────────────────── │  https://your-api.onrender.com   │
└─────────────────────────────────┘     Bearer Auth & CORS    └──────────────────────────────────┘
                                                                               │
                                                                               │ Mongoose
                                                                               ▼
                                                              ┌──────────────────────────────────┐
                                                              │          MongoDB Atlas           │
                                                              │       Cloud M0 Database          │
                                                              └──────────────────────────────────┘
```

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Create a new **Free Shared Cluster (M0)** (e.g. AWS / us-east-1).
3. **Database Access (User)**:
   - Navigate to **Security** > **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `inkguard_admin` (or your preferred name).
   - Password: Choose a secure password (save this).
   - Role: **Atlas Admin** or **Read and write to any database**.
4. **Network Access (IP Whitelist)**:
   - Navigate to **Security** > **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere (`0.0.0.0/0`)** so Render can connect.
   - Click **Confirm**.
5. **Get Connection String**:
   - Go to **Database** > **Clusters** > Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection URI provided by Atlas (it starts with `mongodb+srv://`).
   - Replace the `<db_password>` placeholder with your actual database user password.
   - Insert `/inkguard` right before the `?` query parameters so it connects to the `inkguard` database.


---

## Step 2: Deploy Backend to Render

### Option A: Using Render Web Service (Standard)

1. Push your latest code to your GitHub repository.
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and choose **Web Service**.
4. Connect your GitHub repository: `InkGuard-AI Powered Brand Governance Platform` (or your repo name).
5. Configure the service:
   - **Name**: `inkguard-backend` (or your chosen name)
   - **Region**: Oregon (US West) or closest to your database
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Click **Advanced** and add the following **Environment Variables**:

| Variable Key | Value Example | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations & secure flags |
| `PORT` | `10000` | Port for Render web service |
| `MONGODB_URI` | `mongodb+srv://.../inkguard?...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | *(Click "Generate" or random 32+ char string)* | Secret for signing JWT sessions |
| `COOKIE_SECRET` | *(Click "Generate" or random 32+ char string)* | Secret for cookie parsing |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (can update after Step 3) |
| `GEMINI_API_KEY` | *(Optional)* | Gemini API key for AI governance reviews |
| `OPENAI_API_KEY` | *(Optional)* | OpenAI API key fallback |

7. Click **Create Web Service**.
8. Once deployment finishes, copy your Render service URL:
   `https://inkguard-backend.onrender.com`
9. Test it in your browser:
   - Visit `https://inkguard-backend.onrender.com/` → returns `{ success: true, status: "operational" }`
   - Visit `https://inkguard-backend.onrender.com/api/health` → returns `{ status: "healthy", database: "connected" }`

---

## Step 3: Deploy Frontend to Vercel

1. Sign in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and select `frontend` (or leave as root; both have `vercel.json` configured!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:

| Key | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://inkguard-backend.onrender.com` | Your deployed Render backend URL **(without trailing slash)** |

6. Click **Deploy**.
7. Vercel will build the frontend and provide your production URL:
   `https://inkguard.vercel.app` (or similar).

---

## Step 4: Link Frontend URL in Render

1. Return to your [Render Dashboard](https://dashboard.render.com/).
2. Open your `inkguard-backend` service > **Environment**.
3. Update the `FRONTEND_URL` variable to your actual Vercel URL:
   ```
   FRONTEND_URL=https://inkguard.vercel.app
   ```
4. Click **Save Changes** (Render will automatically re-deploy with updated CORS settings).

*(Note: The backend CORS configuration also automatically permits `localhost` and any `*.vercel.app` domain, so preview branches work out-of-the-box!)*

---

## Step 5: Seed Demo Accounts & Data (Cloud Atlas)

To populate your cloud database with the default brand guidelines, rules, approved facts, and demo users:

### Option A: Run Seed via Render Shell (Easiest)
1. In Render dashboard, go to your `inkguard-backend` service.
2. Open the **Shell** tab on the left.
3. Run:
   ```bash
   npm run seed
   ```
4. Output will confirm database seeding and display the demo credentials:
   - **Admin**: `admin@inkguard.demo` / `Password123!`
   - **Reviewer**: `reviewer@inkguard.demo` / `Password123!`
   - **Creator**: `creator@inkguard.demo` / `Password123!`

### Option B: Run Seed Locally against Atlas
From your local machine in the `backend/` directory:
```bash
# Temporarily pass your Atlas URI
MONGODB_URI="mongodb+srv://.../inkguard?retryWrites=true&w=majority" npm run seed
```

---

## ✅ Verification Checklist

- [ ] Backend root `https://<backend>.onrender.com/` returns `200 OK`
- [ ] Backend health `https://<backend>.onrender.com/api/health` shows `database: "connected"`
- [ ] Frontend opens on Vercel (`https://<frontend>.vercel.app`)
- [ ] Sign in with `admin@inkguard.demo` and `Password123!`
- [ ] Direct page refresh on any route (e.g. `/rules`, `/audit`, `/review`) works without 404
- [ ] Brand Assets view loads logos and banners properly
- [ ] Run a test content audit in "Submit Content" studio
