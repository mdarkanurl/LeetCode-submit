# Use official Node.js LTS image
FROM node:alpine

# Set working directory
WORKDIR /app

# Start the server
CMD ["node", "runner.js"]
