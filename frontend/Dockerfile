# Use Node alpine for lightweight image
FROM node:22-alpine

WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json* ./

# Install dependencies
# We use 'npm ci' if lockfile exists, else 'npm install'
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy project files
COPY . .

EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]