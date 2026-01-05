# 部署指南

本指南介绍如何在不同环境中部署 MCP Decorator Framework 服务器。

## Claude Desktop 集成

### 1. 构建你的服务器

```bash
npm run build
```

### 2. 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS/Linux:**

```bash
~/.config/claude/claude_desktop_config.json
```

**Windows:**

```
%APPDATA%\Claude\claude_desktop_config.json
```

添加你的服务器配置：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/your/dist/server.js"]
    }
  }
}
```

### 3. 重启 Claude Desktop

重启 Claude Desktop 以加载新配置。

## Docker 部署

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY src ./src

# 构建
RUN npm run build

# 暴露端口（HTTP 模式）
EXPOSE 3000

# 启动服务器
CMD ["node", "dist/server.js"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t my-mcp-server .

# 运行容器（HTTP 模式）
docker run -p 3000:3000 my-mcp-server

# 运行容器（stdio 模式）
docker run -i my-mcp-server
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    restart: unless-stopped
```

## Vercel 部署

使用 `createMcpApp` 返回 Hono 实例，直接导出即可部署到 Vercel。

### 1. 创建 API 路由

```typescript
// api/[[...route]].ts
import { createMcpApp } from "@mcp-decorator/core";
import { MathPlugin } from "@mcp-decorator/plugin-math";
import { handle } from "hono/vercel";

const app = await createMcpApp({
  name: "my-mcp-server",
  version: "1.0.0",
  plugins: [new MathPlugin()],
  basePath: "/api",
});

// 自定义路由
app.get("/api", (c) => c.json({ name: "my-mcp-server", status: "ok" }));
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

export const GET = handle(app);
export const POST = handle(app);
```

### 2. vercel.json

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": null
}
```

### 3. 部署

```bash
vercel deploy
```

MCP 端点：`https://your-app.vercel.app/api/mcp`

### Cloudflare Workers 部署

```typescript
// src/index.ts
import { createMcpApp } from "@mcp-decorator/core";
import { MathPlugin } from "@mcp-decorator/plugin-math";

const app = await createMcpApp({
  name: "my-mcp-server",
  plugins: [new MathPlugin()],
});

export default app;
```

### Bun 本地运行

```typescript
import { createMcpApp } from "@mcp-decorator/core";
import { MathPlugin } from "@mcp-decorator/plugin-math";

const app = await createMcpApp({
  name: "my-mcp-server",
  plugins: [new MathPlugin()],
});

// 自定义路由
app.get("/", (c) => c.text("MCP Server"));

export default {
  port: 3000,
  fetch: app.fetch,
};
```

运行：`bun run src/index.ts`

## Railway 部署

### 1. 创建 railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node dist/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. 部署

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

## PM2 部署（生产环境）

### 1. 安装 PM2

```bash
npm install -g pm2
```

### 2. 创建 ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: "mcp-server",
      script: "./dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
```

### 3. 启动服务

```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart mcp-server

# 停止
pm2 stop mcp-server
```

## Systemd 服务（Linux）

### 1. 创建服务文件

```bash
sudo nano /etc/systemd/system/mcp-server.service
```

### 2. 服务配置

```ini
[Unit]
Description=MCP Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/server
ExecStart=/usr/bin/node /path/to/your/server/dist/server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=mcp-server

[Install]
WantedBy=multi-user.target
```

### 3. 启用和启动

```bash
# 重载配置
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable mcp-server

# 启动服务
sudo systemctl start mcp-server

# 查看状态
sudo systemctl status mcp-server

# 查看日志
sudo journalctl -u mcp-server -f
```

## 环境变量

### 推荐的环境变量

```bash
# 服务器配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# 日志级别
LOG_LEVEL=info

# 插件配置
FILESYSTEM_BASE_PATH=/data
HTTP_TIMEOUT=30000
```

### 使用 .env 文件

```bash
# .env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

```typescript
// 在代码中使用
import dotenv from "dotenv";
dotenv.config();

createHttpServer({
  name: "my-server",
  port: parseInt(process.env.PORT || "3000"),
  logLevel: (process.env.LOG_LEVEL as any) || "info",
});
```

## 反向代理（Nginx）

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /mcp/ {
        proxy_pass http://localhost:3000/mcp/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HTTPS 配置（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 监控和日志

### 健康检查端点

```typescript
import { createMcpApp } from "@mcp-decorator/core";

const app = await createMcpApp({
  name: "my-server",
});

// 添加健康检查
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 启动服务
import { serve } from "@hono/node-server";
serve({ fetch: app.fetch, port: 3000 });
```

### 日志管理

使用 Winston 或 Pino 进行结构化日志：

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

## 性能优化

### 1. 启用集群模式

```typescript
import cluster from "cluster";
import os from "os";

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  createHttpServer({ name: "my-server", port: 3000 });
}
```

### 2. 启用压缩

```typescript
import { createMcpApp } from "@mcp-decorator/core";
import { compress } from "hono/compress";

const app = await createMcpApp({
  name: "my-server",
});

app.use("*", compress());

import { serve } from "@hono/node-server";
serve({ fetch: app.fetch, port: 3000 });
```

### 3. 缓存策略

根据你的使用场景实现适当的缓存策略。

## 安全建议

1. **使用 HTTPS**：在生产环境中始终使用 HTTPS
2. **限流**：实现请求限流防止滥用
3. **认证**：添加 API 密钥或 OAuth 认证
4. **CORS**：正确配置 CORS 策略
5. **输入验证**：使用 Zod 严格验证所有输入
6. **文件系统安全**：使用 FilesystemPlugin 的 basePath 限制

## 故障排查

### 常见问题

1. **端口被占用**

   ```bash
   # 查找占用端口的进程
   lsof -i :3000
   # 或
   netstat -ano | findstr :3000
   ```

2. **权限问题**

   ```bash
   # 确保有执行权限
   chmod +x dist/server.js
   ```

3. **内存泄漏**
   ```bash
   # 使用 Node.js 内存分析
   node --inspect dist/server.js
   ```

## 备份和恢复

定期备份你的配置文件和数据：

```bash
# 备份脚本
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz \
  dist/ \
  package.json \
  .env
```
