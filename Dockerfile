# --- Stage 1: Build frontend (Vite) ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production runtime (Express) ---
FROM node:20-alpine AS runtime
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built frontend and server
COPY --from=build /app/dist ./dist
COPY server ./server

# Cloud Run expects the container to listen on PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
