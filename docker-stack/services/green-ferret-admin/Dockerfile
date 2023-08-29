FROM node:20.5.1 AS builder

# Create a working directory
RUN mkdir /buildDir
WORKDIR /buildDir

# Copy the source code
COPY . .

# Install the dependencies and compile the TypeScript code
RUN npm install
RUN npm run build

# Create the production image
FROM node:20.5.1-alpine AS production

# Create a working directory
RUN mkdir /app
RUN mkdir /app/.next
WORKDIR /app

# Copy the built app
COPY --from=builder /buildDir/package.json .
COPY --from=builder /buildDir/.next ./.next
copy --from=builder /buildDir/next.config.js .

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start the app
CMD ["npm", "run", "start"]

# Enable containerd in experimental features (https://docs.docker.com/desktop/containerd/)
# Build multi platform image
# docker buildx build --push --platform linux/arm64,linux/amd64 --tag aleben/green-ferret_admin:latest --tag aleben/green-ferret_admin:1.0.2 .