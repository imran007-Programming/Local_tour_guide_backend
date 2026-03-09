# Notification System Setup Guide

## Backend Setup

### 1. Run Prisma Migration

```bash
cd backend
npx prisma migrate dev --name add_notifications
npx prisma generate
```

### 2. Restart Backend Server

```bash
npm run dev
```

## What's Been Added

### Database
- New `Notification` table with fields: id, userId, type, title, message, isRead, metadata, createdAt
- New `NotificationType` enum: BOOKING, PAYMENT, CANCELLATION, REVIEW, GENERAL

### Backend API Endpoints
- `GET /api/notifications` - Get all user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Automatic Notifications Triggered On:

1. **New Booking** → Notifies Guide
   - When tourist creates a booking

2. **Payment Success** → Notifies Both Tourist & Guide
   - When payment is completed via Stripe webhook

3. **Booking Cancelled** → Notifies Guide
   - When tourist cancels booking

4. **Booking Status Updated** → Notifies Tourist
   - When guide confirms/cancels booking

5. **New Review** → Notifies Guide
   - When tourist leaves a review

### Frontend Components
- `NotificationBell` component in navbar (shows unread count)
- `/dashboard/notifications` page (full notification management)
- Auto-polls every 30 seconds for new notifications

## Testing

1. Create a booking as tourist → Guide receives notification
2. Make payment → Both receive notifications
3. Leave a review → Guide receives notification
4. Cancel booking → Guide receives notification

## Notes
- Notifications are user-specific and secured by authentication
- Unread notifications show with blue background
- Bell icon shows red badge with unread count
