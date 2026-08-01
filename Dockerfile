FROM node:22-alpine AS builder
WORKDIR /app
# Override NODE_ENV so npm ci installs devDependencies (needed for Next.js build)
ENV NODE_ENV=development
COPY . .
RUN npm ci
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
