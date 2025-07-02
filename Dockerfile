# Use official Node.js LTS image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the server port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
