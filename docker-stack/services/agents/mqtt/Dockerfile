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
RUN mkdir /app/dist
WORKDIR /app

# Copy the built app
COPY --from=builder /buildDir/package.json .
COPY --from=builder /buildDir/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# Start the app
CMD ["node", "dist/main.js"]

# Enable containerd in experimental features (https://docs.docker.com/desktop/containerd/)
# Build multi platform image
# docker buildx build --push --platform linux/arm64,linux/amd64 --tag aleben/green-ferret_mqtt-agent:latest --tag aleben/green-ferret_mqtt-agent:1.2 .