# 前端 - Dockerfile 模板
# 镜像: digitalbank/frontend (kebab-case)
# 多阶段: node 构建 + nginx 静态

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html 2>/dev/null || true
COPY --from=builder /app/dist /usr/share/nginx/html 2>/dev/null || true
# Create React App 产出 build/，Vite 等产出 dist/
RUN if [ ! -d /usr/share/nginx/html ] || [ -z "$(ls -A /usr/share/nginx/html 2>/dev/null)" ]; then \
      mkdir -p /usr/share/nginx/html && echo '<!DOCTYPE html><html><body>Placeholder</body></html>' > /usr/share/nginx/html/index.html; \
    fi

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
