FROM node:26-alpine AS builder
RUN apk add --no-cache openssl ca-certificates
WORKDIR /app
COPY package*.json ./
COPY patches ./patches/
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Generate Prisma client and build Next.js application
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:26-alpine AS runner
RUN apk add --no-cache openssl ca-certificates

WORKDIR /app

# Copy production files DARI TAHAP BUILDER (--from=builder)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/tsconfig.json ./

# Saya juga menyarankan menambahkan folder scripts karena 
# di CMD bawahnya Anda menggunakan "node scripts/setup-admin.js"
COPY --from=builder /app/scripts ./scripts 

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && (if [ -n \"$ADMIN_EMAIL\" ] && [ -n \"$ADMIN_PASSWORD\" ]; then node scripts/setup-admin.js \"$ADMIN_EMAIL\" \"$ADMIN_PASSWORD\"; fi) && npx tsx src/server/index.ts"]
