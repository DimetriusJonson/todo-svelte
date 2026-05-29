# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY src/ ./src
COPY static/ ./static
COPY .env ./
COPY package.json ./
#COPY package-lock.json ./
COPY svelte.config.node.js ./svelte.config.js
COPY tsconfig.json ./
COPY vite.config.ts ./

#RUN npm ci
RUN npm install

RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/build ./build

EXPOSE 3000
ENV NODE_ENV=production

USER node

CMD ["node", "build/index.js"]
