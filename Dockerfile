# ---------- Base image for building frontend ----------
FROM node:18 AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code and build it
COPY . .
RUN npm run build

# ---------- Backend stage with Node.js and Python ----------
FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    pip install --upgrade pip

# Set working directory
WORKDIR /usr/src/app

# Copy Python requirements and install if present
COPY requirements.txt ./
RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

# Copy backend code and built frontend assets
COPY --from=frontend-builder /app /usr/src/app

# Install backend Node dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Expose the port your backend listens on (e.g., 3000)
EXPOSE 3000

# Start your app (adjust if needed)
CMD ["npm", "start"]
