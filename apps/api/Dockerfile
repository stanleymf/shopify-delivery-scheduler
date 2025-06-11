FROM node:18-alpine

WORKDIR /app

# Copy workspace files from parent directories
COPY ../../pnpm-lock.yaml ./
COPY ../../pnpm-workspace.yaml ./
COPY ../../package.json ./

# Copy the API package files
COPY package*.json ./apps/api/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the API source code
COPY . ./apps/api/

# Change to API directory for build
WORKDIR /app/apps/api

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["pnpm", "start"] 