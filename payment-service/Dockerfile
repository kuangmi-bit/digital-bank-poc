# 支付服务 - Dockerfile 模板
# 镜像: digitalbank/payment-service (kebab-case)

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build 2>/dev/null || true

FROM node:20-alpine
WORKDIR /app

RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app
USER app

COPY --from=builder /app .

EXPOSE 3001

# 由 package.json 的 "start" 决定入口；无 start 时可改为 CMD ["node", "index.js"]
CMD ["npm", "start"]
