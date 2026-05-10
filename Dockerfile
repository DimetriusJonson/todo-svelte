# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/build ./build

EXPOSE 3000
ENV NODE_ENV=production

USER node

CMD ["node", "build/index.js"]
