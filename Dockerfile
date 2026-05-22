FROM node:20-alpine
WORKDIR /app/backend-edustrategy
COPY backend-edustrategy/package*.json ./
RUN npm install --omit=dev
COPY backend-edustrategy/ ./
EXPOSE 5000
CMD ["node", "servidor.js"]
