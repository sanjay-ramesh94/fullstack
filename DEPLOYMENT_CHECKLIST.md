# Deployment Checklist

## Pre-Deployment Steps

- [ ] Push code to GitHub (if not already done)
- [ ] Test application locally with `npm run dev` in both client and server
- [ ] Verify all API endpoints work correctly

## Step 1: MongoDB Atlas Setup (5 minutes)

- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create free cluster
- [ ] Create database user with username and password
- [ ] Whitelist IP (0.0.0.0/0 for free tier)
- [ ] Get connection string and replace `<password>` with your password
- [ ] Connection string format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hall_booking?retryWrites=true&w=majority`

## Step 2: Backend Deployment on Render (10 minutes)

- [ ] Create Render account at https://render.com
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Set build command: `npm install`
- [ ] Set start command: `node server.js`
- [ ] Add environment variables:
  - [ ] `MONGODB_URI` = your MongoDB connection string
  - [ ] `EMAIL_USER` = your Gmail address
  - [ ] `EMAIL_PASS` = your Gmail app password
  - [ ] `ADMIN_EMAIL` = admin email
  - [ ] `JWT_SECRET` = long random string
  - [ ] `NODE_ENV` = production
  - [ ] `CORS_ORIGIN` = (leave empty for now, update after frontend deployment)
- [ ] Deploy and wait for completion
- [ ] Copy backend URL (e.g., `https://hall-booking-server.onrender.com`)

## Step 3: Frontend Deployment on Vercel (10 minutes)

- [ ] Create Vercel account at https://vercel.com
- [ ] Import GitHub repository
- [ ] Select `client` folder as root directory
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL` = your backend URL from Step 2 (e.g., `https://hall-booking-server.onrender.com/api`)
- [ ] Deploy and wait for completion
- [ ] Copy frontend URL (e.g., `https://your-project.vercel.app`)

## Step 4: Update Backend CORS

- [ ] Go back to Render dashboard
- [ ] Update `CORS_ORIGIN` environment variable with your frontend URL
- [ ] Redeploy backend (click "Manual Deploy")

## Step 5: Testing

- [ ] Open frontend URL in browser
- [ ] Test user registration
- [ ] Test user login
- [ ] Test booking creation
- [ ] Test admin login
- [ ] Test admin dashboard
- [ ] Check that emails are being sent

## Troubleshooting

### Backend not responding
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Check browser console for CORS errors
- Verify `VITE_API_URL` environment variable is set correctly
- Check that backend URL is accessible

### Emails not sending
- Verify Gmail app password is correct (not regular password)
- Check that 2-factor authentication is enabled on Gmail
- Verify email service configuration in backend

## Important Notes

- **Render Free Tier**: Your backend will spin down after 15 minutes of inactivity. First request after spin-down will take 30-60 seconds.
- **MongoDB Atlas Free Tier**: Limited to 512MB storage
- **Vercel Free Tier**: 100GB bandwidth per month
- **Gmail App Password**: Required for sending emails. Generate at https://myaccount.google.com/apppasswords

## After Deployment

- Monitor logs regularly
- Test all features thoroughly
- Consider upgrading to paid tiers for production use
- Set up custom domain (optional)

