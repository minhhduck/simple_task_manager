FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# For simple development/testing, we'll use vite preview or dev
# In a real prod setup, run build and serve with nginx
# But prompt asked for "simple locally testable" and "docker-compose"
CMD ["npm", "run", "dev", "--", "--host"]
