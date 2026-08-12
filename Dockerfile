FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Install dependencies and build the frontend
RUN npm run build

# Make the entrypoint script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 5000

# Entrypoint handles JWT_SECRET generation before handing off to CMD
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
