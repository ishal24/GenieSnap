# Gunakan image Node.js ringan
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Salin file dependency dan install
COPY package*.json ./
RUN npm install

# Salin semua file project ke dalam container
COPY . .

# Expose port 3000 (port server.js)
EXPOSE 3000

# Jalankan server Express
CMD ["node", "server.js"]
