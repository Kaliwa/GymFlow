FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

COPY .env ./

RUN npm run build

EXPOSE ${PORT:-3000}

CMD ["npm", "run", "dev"]
