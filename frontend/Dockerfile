# Use official Nginx image as the base image for serving static frontend files
FROM nginx:alpine

# Copy all frontend files to the default Nginx html directoy
COPY . /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
