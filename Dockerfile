FROM node:20-slim

# Install system dependencies: ffmpeg, python3, pip, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python-is-python3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally with fallback
RUN python3 -m pip install --no-cache-dir --break-system-packages yt-dlp || (curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp)

WORKDIR /app

# Copy package manifests and install node dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure temp directory exists
RUN mkdir -p /app/temp

# Environment variables
ENV NODE_ENV=production

EXPOSE 3000 10000

CMD ["node", "server/index.js"]

