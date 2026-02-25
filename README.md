# Local Guide Tour Backend

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: Stripe
- **File Upload**: Cloudinary, Multer
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## Setup

### Prerequisites
- Node.js
- PostgreSQL
- Stripe account
- Cloudinary account

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/tour_guide_db?schema=public
SALT=10
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET_KEY=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_SECRET_WEBHOOK=your_webhook_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

### Database Setup

```bash
npm run migrate
npm run generate
```

### Run

```bash
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Tourist
- `GET /api/tourist` - Get all tourists
- `GET /api/tourist/:id` - Get tourist by ID
- `PATCH /api/tourist` - Update tourist (Auth: TOURIST)

### Wishlist
- `GET /api/tourist/wishlist` - Get wishlist (Auth: TOURIST)
- `POST /api/tourist/wishlist` - Add to wishlist (Auth: TOURIST)
- `DELETE /api/tourist/wishlist/:tourId` - Remove from wishlist (Auth: TOURIST)

### Tour
- `GET /api/tour` - Get all tours
- `GET /api/tour/:id` - Get tour by ID
- `POST /api/tour` - Create tour (Auth: GUIDE)
- `PATCH /api/tour/:id` - Update tour (Auth: GUIDE)
- `DELETE /api/tour/:id` - Delete tour (Auth: GUIDE)

### Booking
- `POST /api/booking` - Create booking (Auth: TOURIST)
- `GET /api/booking` - Get user bookings (Auth)

### Payment
- `POST /api/payment/create-intent` - Create payment intent (Auth: TOURIST)
- `POST /api/payment/webhook` - Stripe webhook
