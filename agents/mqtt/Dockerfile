FROM node:20.2

# Create a working directory
RUN mkdir /buildDir
WORKDIR /buildDir

# Copy the source code
COPY . .

# Install the dependencies and compile the TypeScript code
RUN npm install
RUN npm run build

# Create the production image
FROM node:20.2-alpine

# Create a working directory
RUN mkdir /app
RUN mkdir /app/dist
WORKDIR /app

# Copy the built app
COPY --from=0 /buildDir/package.json .
COPY --from=0 /buildDir/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# Start the app
CMD ["node", "dist/main.js"]

# docker build -t aleben/green-ferret_mqtt-agent:latest -t aleben/green-ferret_mqtt-agent:1.0 .
# docker push aleben/green-ferret_mqtt-agent:latest && docker push aleben/green-ferret_mqtt-agent:1.0