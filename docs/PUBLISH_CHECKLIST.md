# 📦 NPM 发布检查清单

在发布到 NPM 之前，请确认以下所有项目：

## ✅ 代码质量

- [x] 所有 TypeScript 编译无错误
- [x] 所有测试通过（27/27 tests passing）
- [x] 代码符合 ESLint 规范
- [x] 类型定义完整且正确

## ✅ 包配置

### Core Package (@mcp-decorator/core)

- [x] package.json 配置正确
- [x] 版本号：0.1.0
- [x] 仓库信息：https://github.com/fromsko/mcp-decorator-framework
- [x] 作者：fromsko
- [x] 许可证：MIT
- [x] 导出配置正确
- [x] files 字段包含 dist 和 README.md

### Plugin Packages

- [x] @mcp-decorator/plugin-math 配置正确
- [x] @mcp-decorator/plugin-filesystem 配置正确
- [x] @mcp-decorator/plugin-http 配置正确
- [x] @mcp-decorator/plugin-memory 配置正确
- [x] 所有插件依赖 @mcp-decorator/core@workspace:\*

## ✅ 文档

- [x] README.md 简洁明了，包含快速开始
- [x] docs/GETTING_STARTED.md 完整的入门指南
- [x] docs/API.md 完整的 API 参考
- [x] docs/plugin-development.md 插件开发指南
- [x] docs/deployment.md 部署指南
- [x] docs/PUBLISHING.md NPM 发布指南
- [x] 所有文档链接正确
- [x] 代码示例可运行

## ✅ 构建产物

- [x] packages/core/dist 目录存在且完整
- [x] packages/plugin-math/dist 目录存在且完整
- [x] packages/plugin-filesystem/dist 目录存在且完整
- [x] packages/plugin-http/dist 目录存在且完整
- [x] packages/plugin-memory/dist 目录存在且完整
- [x] 所有 .d.ts 类型定义文件生成

## ✅ 示例代码

- [x] packages/core/examples/basic 基础示例
- [x] packages/core/examples/with-plugins 插件示例
- [x] packages/core/examples/advanced 高级示例
- [x] 所有示例可运行

## 📋 发布前准备

### 1. NPM 账户准备

```bash
# 登录 NPM
npm login

# 验证登录状态
npm whoami
```

### 2. 最终构建

```bash
# 清理旧构建
pnpm -r run clean

# 重新构建
pnpm run build

# 验证构建成功
ls packages/*/dist
```

### 3. 版本确认

当前版本：**0.1.0**

所有包版本一致：

- @mcp-decorator/core: 0.1.0
- @mcp-decorator/plugin-math: 0.1.0
- @mcp-decorator/plugin-filesystem: 0.1.0
- @mcp-decorator/plugin-http: 0.1.0
- @mcp-decorator/plugin-memory: 0.1.0

## 🚀 发布命令

### 按顺序发布（推荐）

```bash
# 1. 发布核心包（必须先发布）
cd packages/core
pnpm publish --access public

# 等待 1-2 分钟让 NPM 索引更新

# 2. 发布插件包（可以并行）
cd ../plugin-math
pnpm publish --access public

cd ../plugin-filesystem
pnpm publish --access public

cd ../plugin-http
pnpm publish --access public

cd ../plugin-memory
pnpm publish --access public
```

### 一键发布所有包

```bash
# 从根目录执行
pnpm -r publish --access public
```

## ✅ 发布后验证

### 1. 检查 NPM 页面

访问以下链接确认包已发布：

- [ ] https://www.npmjs.com/package/@mcp-decorator/core
- [ ] https://www.npmjs.com/package/@mcp-decorator/plugin-math
- [ ] https://www.npmjs.com/package/@mcp-decorator/plugin-filesystem
- [ ] https://www.npmjs.com/package/@mcp-decorator/plugin-http
- [ ] https://www.npmjs.com/package/@mcp-decorator/plugin-memory

### 2. 测试安装

```bash
# 创建测试目录
mkdir test-npm-install
cd test-npm-install

# 初始化项目
npm init -y

# 安装包
npm install @mcp-decorator/core reflect-metadata zod
npm install @mcp-decorator/plugin-math
npm install @mcp-decorator/plugin-filesystem
npm install @mcp-decorator/plugin-http
npm install @mcp-decorator/plugin-memory

# 验证安装
ls node_modules/@mcp-decorator
```

### 3. 功能测试

创建 `test.ts` 并运行：

```typescript
import "reflect-metadata";
import { createStdioServer } from "@mcp-decorator/core";
import { MathPlugin } from "@mcp-decorator/plugin-math";

createStdioServer({
  name: "test-server",
  version: "1.0.0",
  plugins: [new MathPlugin()],
});
```

## 📝 发布后任务

- [ ] 在 GitHub 创建 Release（v0.1.0）
- [ ] 更新 CHANGELOG.md
- [ ] 在社交媒体宣布发布
- [ ] 更新项目网站（如果有）
- [ ] 通知用户和贡献者

## 🔄 下次发布准备

### 更新版本号

```bash
# 补丁版本（0.1.0 -> 0.1.1）
pnpm -r exec npm version patch

# 次版本（0.1.0 -> 0.2.0）
pnpm -r exec npm version minor

# 主版本（0.1.0 -> 1.0.0）
pnpm -r exec npm version major
```

## 🆘 问题排查

### 权限错误

```bash
# 确保已登录
npm login

# 检查登录状态
npm whoami
```

### 包名冲突

- 确认包名在 NPM 上可用
- 使用作用域包名：@your-scope/package-name

### 版本冲突

- 不能发布已存在的版本
- 使用 `npm version patch` 更新版本号

## 📚 相关文档

- [NPM 发布指南](./docs/PUBLISHING.md)
- [部署指南](./docs/deployment.md)
- [贡献指南](./CONTRIBUTING.md)（如果有）

---

**准备好了吗？** 确认所有检查项后，开始发布！🚀
