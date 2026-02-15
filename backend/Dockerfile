# --- Builder: build the frontend using Node ---
FROM node:20-bullseye-slim AS builder
WORKDIR /build/app

# Copy only package files first for better caching
COPY ../app/package*.json ./
COPY ../app/vite.config.ts ./
COPY ../app/tsconfig.json ./

# Copy the rest of the frontend sources
COPY ../app/ ./

RUN npm ci --prefer-offline --no-audit --progress=false
RUN npm run build

# --- Runtime: Python API image ---
FROM python:3.11-slim
WORKDIR /app

# Install Python dependencies from the repo
COPY src/requirements.txt ./src/requirements.txt
RUN pip install --no-cache-dir -r src/requirements.txt

# Copy backend code
COPY . .

# Copy built frontend from the builder stage into /app/dist
COPY --from=builder /build/app/dist /app/dist

EXPOSE 80

# Start the API
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "80"]