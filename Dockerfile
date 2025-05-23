# Stage 1: Build the application
FROM node:18-alpine as builder

WORKDIR /app

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip build-base

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Install Python runtime
RUN apk add --no-cache python3

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application
COPY --from=builder /app .

# Copy Python ML model files
COPY --from=builder /app/ml_model ./ml_model

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Run the application
CMD ["npm", "start"]