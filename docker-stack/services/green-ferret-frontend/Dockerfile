FROM node:20.5.1 AS builder

# Create a working directory
RUN mkdir /buildDir
WORKDIR /buildDir

# Copy the source code
COPY . .

# Install the dependencies and compile the TypeScript code
RUN npm install
RUN export REACT_APP_INFLUXDB_URL="http://influxdb:8086" && export REACT_APP_INFLUXDB_TOKEN="5EwQ_ipsZPpc-rr9rvVYFTEAj4d1RKOGfTVUkAnUnd1c5F-IMCVs2IovHMwkBA_-0mz-JJpa5gmF38EhCjcpDA==" && npm run build

# Create the production image
FROM node:20.5.1-alpine AS production

# Create a working directory
RUN mkdir /app
RUN mkdir /app/build
WORKDIR /app

# Copy the built app
COPY --from=builder /buildDir/package.json .
COPY --from=builder /buildDir/build ./build

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

HEALTHCHECK --interval=5m --timeout=10s --start-period=30s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start the app
CMD ["npx", "serve", "-s", "build"]

# Create builder to use new features (https://cloudolife.com/2022/03/05/Infrastructure-as-Code-IaC/Container/Docker/Docker-buildx-support-multiple-architectures-images/)
# docker buildx create --name mybuilder --use
# docker buildx use mybuilder
# Build multi platform image
# docker buildx build --push --platform linux/arm64,linux/amd64 --tag aleben/green-ferret_frontend:latest --tag aleben/green-ferret_frontend:1.0 .