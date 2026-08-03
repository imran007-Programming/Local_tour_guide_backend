# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY . .

RUN npm run build


# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]