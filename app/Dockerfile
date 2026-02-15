# Stage 1: Build de React app
FROM node:20-bullseye-slim AS builder

WORKDIR /build

# Kopieer package bestanden (relatief aan de 'app' map)
COPY package*.json ./
RUN npm install

# Kopieer de rest van de frontend broncode
COPY . .

# Bouw de productiebestanden
RUN npm run build

# Stage 2: Serveer de bestanden met Nginx
FROM nginx:stable-alpine

# Kopieer de build output naar de Nginx html map
COPY --from=builder /build/dist /usr/share/nginx/html

# Exponeer poort 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]