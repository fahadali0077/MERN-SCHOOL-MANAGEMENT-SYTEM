FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Create upload directory
RUN mkdir -p uploads logs

# Copy source
COPY . .

EXPOSE 5000

CMD ["node", "src/app.js"]
