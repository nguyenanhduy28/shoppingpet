FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (to cache dependencies)
COPY package*.json ./

# Install dependencies (only production dependencies are needed)
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Expose port 5000 for the backend server
EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
