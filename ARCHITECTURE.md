# Application Architecture

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│                                                                   │
│  https://your-project-name.vercel.app                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────┐                   ┌──────────────────┐
│    VERCEL        │                   │     RENDER       │
│  (Frontend)      │                   │   (Backend)      │
│                  │                   │                  │
│  React + Vite    │                   │  Node.js +       │
│  TailwindCSS     │                   │  Express         │
│                  │                   │                  │
│  Hosted at:      │                   │  Hosted at:      │
│  vercel.app      │                   │  onrender.com    │
└──────────────────┘                   └────────┬─────────┘
                                                │
                                                │ MongoDB Driver
                                                │
                                        ┌───────▼────────┐
                                        │  MONGODB ATLAS │
                                        │   (Database)   │
                                        │                │
                                        │  Cloud MongoDB │
                                        │  512MB Free    │
                                        └────────────────┘
```

## Data Flow

### User Registration/Login
```
Browser → Vercel (React) → Render (Express) → MongoDB Atlas
                                    ↓
                            JWT Token Created
                                    ↓
                          Browser (localStorage)
```

### Booking Creation
```
Browser → Vercel (React) → Render (Express) → MongoDB Atlas
                                    ↓
                            Email Service
                                    ↓
                              Gmail SMTP
```

### Admin Dashboard
```
Browser → Vercel (React) → Render (Express) → MongoDB Atlas
                                    ↓
                            PDF Report Generation
                                    ↓
                          Browser (Download)
```

## Technology Stack

### Frontend (Vercel)
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Date Handling**: date-fns
- **Calendar**: react-calendar

### Backend (Render)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **PDF Generation**: PDFKit
- **Rate Limiting**: express-rate-limit
- **Validation**: express-validator

### Database (MongoDB Atlas)
- **Type**: NoSQL Document Database
- **Collections**:
  - Users
  - Bookings (Video Conference, Convention Center, Lab, MBA Seminar)
  - Admin Accounts

## API Endpoints

### Authentication
```
POST   /api/auth/register          - User registration
POST   /api/auth/login/user        - User login
POST   /api/auth/login/admin       - Admin login
```

### Booking
```
GET    /api/booking/available-dates         - Get available dates
GET    /api/booking/date/:date              - Get bookings for date
POST   /api/booking/create                  - Create new booking
GET    /api/booking/my-bookings             - Get user's bookings
PATCH  /api/booking/:id/cancel              - Cancel booking
```

### Admin
```
GET    /api/admin/events/:date              - Get events for date
GET    /api/admin/all-bookings              - Get all bookings
PATCH  /api/admin/booking/:id/status        - Update booking status
DELETE /api/admin/booking/:id               - Delete booking
GET    /api/admin/download-report           - Download PDF report
```

### Hall-Specific Routes
```
/api/video-conference/...
/api/convention-center/...
/api/lab/...
/api/mba-seminar/...
```

## Security Features

1. **Authentication**
   - JWT tokens for session management
   - Tokens stored in localStorage
   - Auto-logout on 401 response

2. **Password Security**
   - Bcryptjs for password hashing
   - Salt rounds: 10

3. **API Security**
   - CORS enabled (configurable)
   - Rate limiting on auth endpoints
   - Input validation with express-validator

4. **Email Security**
   - Gmail app password (not regular password)
   - 2-factor authentication required
   - Nodemailer with TLS encryption

## Deployment Flow

```
1. Push to GitHub
        ↓
2. Render detects changes
        ↓
3. Render builds backend
        ↓
4. Vercel detects changes
        ↓
5. Vercel builds frontend
        ↓
6. Both deployed automatically
        ↓
7. Application live!
```

## Environment Variables

### Development (Local)
- `.env` in root
- `.env` in client/
- `.env` in server/

### Production (Deployed)
- Set in Render dashboard
- Set in Vercel dashboard
- Never committed to GitHub

## File Structure

```
fullstack/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── App.jsx           # Main app component
│   ├── package.json
│   ├── vite.config.js
│   └── .env                  # Frontend env vars
│
├── server/                    # Node.js Backend
│   ├── controllers/          # Route handlers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── middleware/           # Express middleware
│   ├── config/               # Configuration
│   ├── package.json
│   ├── server.js             # Entry point
│   └── .env                  # Backend env vars
│
├── DEPLOYMENT_GUIDE.md       # Detailed guide
├── DEPLOYMENT_CHECKLIST.md   # Step-by-step checklist
├── GMAIL_SETUP.md            # Email configuration
└── ARCHITECTURE.md           # This file
```

## Scaling Considerations

### Current Free Tier
- Suitable for: Testing, development, small projects
- Users: Up to 100 concurrent
- Storage: 512MB
- Bandwidth: 100GB/month

### When to Upgrade
- More than 100 concurrent users → Render paid plan
- More than 512MB data → MongoDB paid plan
- More than 100GB bandwidth → Vercel paid plan
- Need 24/7 uptime → Render paid plan ($7+/month)

