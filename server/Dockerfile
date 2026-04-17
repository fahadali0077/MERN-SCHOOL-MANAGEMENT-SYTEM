FROM node:20-alpine

WORKDIR /app

# Install dependencies
# Use `npm install` instead of `npm ci` so that newly added packages
# (like cloudinary) are installed even if the lock file predates them.
# In CI/CD pipelines where you want reproducible installs, run
# `npm install` locally first to update the lock file, then commit it.
COPY package*.json ./
RUN npm install --only=production --no-audit --no-fund

# Create required directories
RUN mkdir -p uploads logs

# Copy source
COPY . .

EXPOSE 5000

CMD ["node", "src/app.js"]
