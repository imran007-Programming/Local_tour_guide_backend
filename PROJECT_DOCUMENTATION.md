# Local Guide Tour - Full Stack Application

## 🎯 Project Overview

A comprehensive tour booking platform connecting tourists with local guides. Features include real-time chat, notifications, payment processing, and review systems.

---

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Access + Refresh Tokens)
- **Payment**: Stripe
- **File Upload**: Cloudinary + Multer
- **Real-time**: Socket.io
- **Validation**: Zod
- **Security**: bcryptjs

### Frontend (Recommended)
- React/Next.js with TypeScript
- Socket.io-client
- Axios with interceptors
- Tailwind CSS

---

## 🗂️ Database Schema

### Users & Roles
- **User** - Base user model (name, email, password, role, profilePic, bio, languages)
- **Tourist** - Tourist profile (preferences, wishlist, bookings)
- **Guide** - Guide profile (expertise, dailyRate, tours)

### Core Features
- **Tour** - Tour listings (title, description, price, duration, category, images)
- **Booking** - Tour bookings (status: PENDING, CONFIRMED, CANCELLED, REJECTED, COMPLETED, EXPIRED)
- **Review** - Tour reviews (rating, comment)
- **Wishlist** - Tourist wishlists

### Communication
- **Conversation** - Chat conversations between users
- **Message** - Chat messages (content, isRead, sender)
- **Notification** - System notifications (type: BOOKING, PAYMENT, CANCELLATION, REVIEW, GENERAL)

---

## 🔐 Authentication System

### Token Management
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry (httpOnly cookie)
- **Auto-refresh**: Middleware handles token refresh automatically

### Endpoints
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/refresh-token - Refresh access token
POST /api/auth/logout - Logout user
GET /api/auth/me - Get current user profile
```

---

## 📡 API Endpoints

### 👤 Users
```
GET /api/users - Get all users
GET /api/users/:id - Get user by ID
```

### 🧳 Tourists
```
GET /api/tourists - Get all tourists
GET /api/tourists/:id - Get tourist by ID
PATCH /api/tourists - Update tourist profile (Auth: TOURIST)
GET /api/tourists/wishlist - Get wishlist (Auth: TOURIST)
POST /api/tourists/wishlist - Add to wishlist (Auth: TOURIST)
DELETE /api/tourists/wishlist/:tourId - Remove from wishlist (Auth: TOURIST)
```

### 🎒 Guides
```
GET /api/guides - Get all guides
GET /api/guides/:id - Get guide by ID
PATCH /api/guides - Update guide profile (Auth: GUIDE)
```

### 🗺️ Tours
```
GET /api/tour - Get all tours
GET /api/tour/:id - Get tour by ID
POST /api/tour - Create tour (Auth: GUIDE)
PATCH /api/tour/:id - Update tour (Auth: GUIDE)
DELETE /api/tour/:id - Delete tour (Auth: GUIDE)
```

### 📅 Bookings
```
POST /api/bookings - Create booking (Auth: TOURIST)
GET /api/bookings - Get user bookings (Auth)
GET /api/bookings/:id - Get booking by ID (Auth)
PATCH /api/bookings/:id/status - Update booking status (Auth: GUIDE)
```

### ⭐ Reviews
```
POST /api/reviews - Create review (Auth: TOURIST)
GET /api/reviews/tour/:tourId - Get tour reviews
GET /api/reviews/guide/:guideId - Get guide reviews
```

### 💳 Payments
```
POST /api/payments/create-intent - Create payment intent (Auth: TOURIST)
POST /api/payments/webhook - Stripe webhook
```

### 💬 Chat (Real-time)
```
POST /api/chat/send - Send message (Auth)
GET /api/chat/conversations - Get conversations (Auth)
GET /api/chat/messages/:conversationId - Get messages (Auth)
```

### 🔔 Notifications
```
GET /api/notifications - Get user notifications (Auth)
POST /api/notifications/:id/read - Mark as read (Auth)
POST /api/notifications/read-all - Mark all as read (Auth)
DELETE /api/notifications/:id - Delete notification (Auth)
```

---

## 🔌 Socket.io Events

### Client → Server
```javascript
socket.emit('join-conversation', conversationId)
socket.emit('send-message', { conversationId, message })
```

### Server → Client
```javascript
socket.on('new-message', (message) => {})
```

---

## ⚙️ Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tour_guide_db?schema=public

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
SALT=10
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET_KEY=your_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_SECRET_WEBHOOK=your_webhook_secret
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Stripe account
- Cloudinary account

### Installation Steps

```bash
# 1. Clone repository
git clone <repo-url>
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
npm run migrate
npm run generate

# 5. Run development server
npm run dev

# 6. Run production
npm run build
npm start
```

---

## 📦 NPM Scripts

```json
{
  "dev": "ts-node-dev --respawn src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "migrate": "npx prisma migrate dev",
  "generate": "npx prisma generate",
  "studio": "npx prisma studio"
}
```

---

## 🏗️ Project Structure

```
backend/
├── prisma/
│   ├── models/
│   │   ├── schema.prisma
│   │   ├── userSchema.prisma
│   │   ├── tour.schema.prisma
│   │   ├── booking.schema.prisma
│   │   ├── review.schema.prisma
│   │   ├── notification.schema.prisma
│   │   ├── wishlist.schema.prisma
│   │   ├── payment.prisma
│   │   └── enum.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   └── index.ts
│   │   ├── error/
│   │   │   └── ApiError.ts
│   │   ├── helper/
│   │   │   ├── tokenGenarator.ts
│   │   │   └── fileUploader.ts
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── middleware/
│   │   │   └── authHelper.ts
│   │   ├── modules/
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   ├── tourist/
│   │   │   ├── guide/
│   │   │   ├── tour/
│   │   │   ├── Bookings/
│   │   │   ├── review/
│   │   │   ├── payment/
│   │   │   ├── chat/
│   │   │   └── notification/
│   │   ├── routes/
│   │   │   └── index.ts
│   │   └── shared/
│   │       ├── catchAsync.ts
│   │       └── sendResponse.ts
│   ├── types/
│   │   └── user.interface.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security Features

- ✅ JWT Authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (TOURIST, GUIDE, ADMIN)
- ✅ HTTP-only cookies for refresh tokens
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma ORM)

---

## 🎨 Key Features

### For Tourists
- Browse and search tours
- Book tours with Stripe payment
- Real-time chat with guides
- Wishlist management
- Review and rate tours
- Receive notifications
- View booking history

### For Guides
- Create and manage tours
- Accept/reject bookings
- Chat with tourists
- View earnings
- Receive booking notifications
- Manage profile and expertise

### Admin Features
- User management
- Tour moderation
- Booking oversight
- System notifications

---

## 🌐 Deployment

### Option 1: Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway add # Add PostgreSQL
railway up
```

### Option 2: Render
1. Connect GitHub repo
2. Build: `npm install && npm run build && npx prisma generate`
3. Start: `npm start`
4. Add PostgreSQL database
5. Set environment variables

### Option 3: AWS Elastic Beanstalk
```bash
eb init
eb create
eb setenv KEY=value
eb deploy
```

### Option 4: Vercel (Serverless)
```bash
npm i -g vercel
vercel
```

---

## 📊 Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

---

## 🧪 Testing Endpoints

Use Postman, Thunder Client, or curl:

```bash
# Register
POST http://localhost:5000/api/auth/register
Body: { "name": "John", "email": "john@example.com", "password": "123456", "role": "TOURIST" }

# Login
POST http://localhost:5000/api/auth/login
Body: { "email": "john@example.com", "password": "123456" }

# Get Tours
GET http://localhost:5000/api/tour

# Create Tour (Auth required)
POST http://localhost:5000/api/tour
Headers: Authorization: Bearer <token>
Body: { "title": "City Tour", "price": 50, ... }
```

---

## 🐛 Common Issues

### Issue: Prisma Client not generated
```bash
npx prisma generate
```

### Issue: Migration failed
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Issue: Socket.io not connecting
- Check CORS settings
- Verify FRONTEND_URL in .env
- Ensure server is running

### Issue: Token expired
- Access token auto-refreshes via middleware
- Check refresh token cookie exists

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorMessages": [
    {
      "path": "field",
      "message": "Validation error"
    }
  ]
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Built with ❤️ for connecting tourists with local guides.

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@localguidetour.com

---

## 🔄 Version History

- **v1.0.0** - Initial release
  - User authentication
  - Tour management
  - Booking system
  - Payment integration
  - Real-time chat
  - Notifications
  - Reviews & ratings
