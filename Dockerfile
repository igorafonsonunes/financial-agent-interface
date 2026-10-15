FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install


FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG API_ORIGIN=http://financial-agent-api:3000
ENV API_ORIGIN=${API_ORIGIN}

RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app ./

EXPOSE 8080

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]