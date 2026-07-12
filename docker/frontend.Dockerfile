# Build a partir da raiz do repositório (ver docker-compose.yml: context: ..)
FROM node:20-alpine

WORKDIR /app

COPY frontend/package.json ./
RUN npm install

COPY frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
