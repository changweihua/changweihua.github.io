# 第一阶段：构建应用
FROM node AS builder

# 构建时传入变量
ARG API_URL
ENV REACT_APP_API_URL=${API_URL}

# 运行时使用
# docker build --build-arg API_URL=https://api.example.com

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# 第二阶段：生产环境
FROM nginx

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./conf/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./conf/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# ENTRYPOINT nginx -g "daemon off;"
