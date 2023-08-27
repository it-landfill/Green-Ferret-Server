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

# Start the app
CMD ["npm", "run", "start"]

# Create builder to use new features (https://cloudolife.com/2022/03/05/Infrastructure-as-Code-IaC/Container/Docker/Docker-buildx-support-multiple-architectures-images/)
# docker buildx create --name mybuilder --use
# docker buildx use mybuilder
# Build multi platform image
# docker buildx build --push --platform linux/arm64,linux/amd64 --tag aleben/green-ferret_admin:latest --tag aleben/green-ferret_admin:1.0.1 .