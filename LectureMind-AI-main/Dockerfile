# Use the official Node.js 18 runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the .env file (if it exists)
COPY .env .env

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
