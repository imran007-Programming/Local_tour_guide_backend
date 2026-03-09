## Run these commands in your backend terminal:

# 1. Regenerate Prisma Client
npx prisma generate

# 2. Restart your backend server
# Press Ctrl+C to stop, then run:
npm run dev

## To test notifications:

1. Login as TOURIST
2. Book a tour
3. Login as GUIDE (the guide who owns that tour)
4. Check notifications - you should see "New Booking Request"

## To manually create a test notification (optional):

Open your database tool and run:
```sql
INSERT INTO notifications (id, "userId", type, title, message, "isRead", "createdAt")
VALUES (
  gen_random_uuid(),
  'YOUR_USER_ID_HERE',
  'GENERAL',
  'Test Notification',
  'This is a test notification',
  false,
  NOW()
);
```

Replace YOUR_USER_ID_HERE with your actual user ID from the users table.
