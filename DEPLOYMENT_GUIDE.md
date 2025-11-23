# Hall Booking System - Free Deployment Guide

## Overview
This guide covers deploying your full-stack MERN application for FREE using:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render.com (Node.js + Express)
- **Database**: MongoDB Atlas (Cloud MongoDB)

---

## Step 1: Prepare Your Project

### 1.1 Create a root package.json (if not exists)
This helps manage both frontend and backend from one place.

### 1.2 Update Environment Variables
Your `.env` file contains sensitive data. You'll need to:
- Keep local `.env` for development
- Add environment variables in deployment platforms (never commit `.env`)

---

## Step 2: Set Up MongoDB Atlas (Free Database)

### 2.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google

### 2.2 Create a Cluster
1. Click "Create" → Select "Free" tier
2. Choose cloud provider (AWS recommended)
3. Select region closest to you
4. Click "Create Cluster"

### 2.3 Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password (save these!)
4. Choose "Built-in Role: Atlas Admin"

### 2.4 Whitelist IP Address
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for free tier
4. Click "Confirm"

### 2.5 Get Connection String
1. Click "Connect" on your cluster
2. Select "Drivers" → "Node.js"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with `hall_booking`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hall_booking?retryWrites=true&w=majority
```

---

## Step 3: Deploy Backend to Render.com (Free)

### 3.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub or email

### 3.2 Connect GitHub Repository
1. Push your project to GitHub (if not already)
2. In Render dashboard, click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your repository

### 3.3 Configure Web Service
- **Name**: `hall-booking-server` (or your choice)
- **Environment**: Node
- **Region**: Choose closest to you
- **Branch**: main
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 3.4 Add Environment Variables
In Render dashboard, go to "Environment" and add:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hall_booking?retryWrites=true&w=majority
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin_email@gmail.com
JWT_SECRET=your_very_long_secure_random_string_here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 3.5 Deploy
- Click "Create Web Service"
- Wait for deployment (2-3 minutes)
- Copy your backend URL (e.g., `https://hall-booking-server.onrender.com`)

**Note**: Free tier on Render spins down after 15 minutes of inactivity. For production, consider paid tier.

---

## Step 4: Deploy Frontend to Vercel (Free)

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 4.2 Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Select the `client` folder as root directory

### 4.3 Configure Build Settings
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4.4 Add Environment Variables
In Vercel dashboard, go to "Settings" → "Environment Variables" and add:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

Update your client `.env` file:
```
VITE_API_URL=http://localhost:5000
```

### 4.5 Deploy
- Click "Deploy"
- Wait for deployment (1-2 minutes)
- Your frontend URL will be shown (e.g., `https://your-project.vercel.app`)

---

## Step 5: Update CORS Configuration

After getting your frontend URL, update backend environment variable:
```
CORS_ORIGIN=https://your-project.vercel.app
```

---

## Step 6: Update Frontend API Calls

Make sure your frontend is using the environment variable for API calls:

In your API service file (likely `src/services/api.js` or similar):
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});
```

---

## Important Notes

### Email Configuration
- Gmail requires "App Password" (not regular password)
- Enable 2-factor authentication on Gmail
- Generate app password at: https://myaccount.google.com/apppasswords

### Free Tier Limitations
- **Render**: Spins down after 15 minutes of inactivity
- **Vercel**: 100GB bandwidth/month
- **MongoDB Atlas**: 512MB storage (usually enough for testing)

### Monitoring
- Render: Check logs in dashboard
- Vercel: Check deployments and logs
- MongoDB Atlas: Monitor usage in cluster dashboard

---

## Troubleshooting

### Backend not connecting to database
- Check MongoDB connection string in environment variables
- Verify IP whitelist in MongoDB Atlas
- Check database user credentials

### Frontend can't reach backend
- Verify CORS_ORIGIN matches frontend URL
- Check backend is running (not spun down on Render)
- Check API_URL in frontend environment variables

### Email not sending
- Verify Gmail app password is correct
- Check email service configuration in backend
- Verify SMTP settings in emailService.js

---

## Next Steps (Optional Upgrades)

For production use, consider:
1. **Render Paid Plan**: $7/month to prevent spin-down
2. **MongoDB Atlas Paid**: For more storage and features
3. **Custom Domain**: Connect your own domain to Vercel
4. **CI/CD**: Set up automatic deployments on GitHub push

---

## Quick Reference

| Service | URL | Free Tier |
|---------|-----|-----------|
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas | 512MB storage |
| Render | https://render.com | Spins down after 15 min |
| Vercel | https://vercel.com | 100GB bandwidth/month |

