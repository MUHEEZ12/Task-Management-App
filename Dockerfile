# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy frontend dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy frontend source and build
COPY client ./client/
WORKDIR /app/client
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install serve to run frontend
RUN npm install -g serve

# Copy backend from builder
COPY --from=builder /app/server ./server
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy built frontend
COPY --from=builder /app/client/dist ./client/dist

# Copy environment files
COPY server/.env.example ./server/.env

EXPOSE 5000 3000

# Start both servers
CMD ["sh", "-c", "cd server && npm start & serve -s client/dist -l 3000"]
