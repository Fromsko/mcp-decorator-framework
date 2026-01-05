# NPM 发布指南

本指南介绍如何将 MCP Decorator Framework 发布到 NPM。

## 发布前检查清单

### 1. 确保所有测试通过

```bash
pnpm test
```

### 2. 确保构建成功

```bash
pnpm run build
```

### 3. 检查版本号

所有包的版本号应该一致：

- `@mcp-decorator/core`: 0.1.0
- `@mcp-decorator/plugin-math`: 0.1.0
- `@mcp-decorator/plugin-filesystem`: 0.1.0
- `@mcp-decorator/plugin-http`: 0.1.0

### 4. 验证 package.json 配置

确保每个包的 package.json 包含：

- ✅ `name`: 正确的包名
- ✅ `version`: 版本号
- ✅ `description`: 描述
- ✅ `main`: 入口文件
- ✅ `types`: 类型定义文件
- ✅ `files`: 要发布的文件列表
- ✅ `repository`: GitHub 仓库信息
- ✅ `author`: fromsko
- ✅ `license`: MIT

## 发布步骤

### 方式一：使用 pnpm 发布所有包

```bash
# 1. 登录 NPM（如果还未登录）
npm login

# 2. 发布所有包（从工作区根目录）
pnpm -r publish --access public

# 或者逐个发布
cd packages/core
pnpm publish --access public

cd ../plugin-math
pnpm publish --access public

cd ../plugin-filesystem
pnpm publish --access public

cd ../plugin-http
pnpm publish --access public
```

### 方式二：使用 npm 发布

```bash
# 1. 登录 NPM
npm login

# 2. 发布核心包
cd packages/core
npm publish --access public

# 3. 发布插件包
cd ../plugin-math
npm publish --access public

cd ../plugin-filesystem
npm publish --access public

cd ../plugin-http
npm publish --access public
```

## 发布顺序

**重要：** 必须按以下顺序发布，因为插件包依赖核心包：

1. `@mcp-decorator/core` （核心包）
2. `@mcp-decorator/plugin-math` （数学插件）
3. `@mcp-decorator/plugin-filesystem` （文件系统插件）
4. `@mcp-decorator/plugin-http` （HTTP 插件）

## 版本管理

### 更新版本号

使用 pnpm 的版本管理功能：

```bash
# 更新所有包的补丁版本（0.1.0 -> 0.1.1）
pnpm -r exec npm version patch

# 更新所有包的次版本（0.1.0 -> 0.2.0）
pnpm -r exec npm version minor

# 更新所有包的主版本（0.1.0 -> 1.0.0）
pnpm -r exec npm version major
```

### 语义化版本规范

- **主版本（Major）**: 不兼容的 API 变更
- **次版本（Minor）**: 向后兼容的功能新增
- **补丁版本（Patch）**: 向后兼容的问题修复

## 发布后验证

### 1. 检查 NPM 上的包

访问以下链接确认包已发布：

- https://www.npmjs.com/package/@mcp-decorator/core
- https://www.npmjs.com/package/@mcp-decorator/plugin-math
- https://www.npmjs.com/package/@mcp-decorator/plugin-filesystem
- https://www.npmjs.com/package/@mcp-decorator/plugin-http

### 2. 测试安装

在新目录中测试安装：

```bash
mkdir test-install
cd test-install
npm init -y
npm install @mcp-decorator/core reflect-metadata zod
npm install @mcp-decorator/plugin-math
npm install @mcp-decorator/plugin-filesystem
npm install @mcp-decorator/plugin-http
```

### 3. 验证功能

创建测试文件 `test.ts`：

```typescript
import "reflect-metadata";
import { createStdioServer } from "@mcp-decorator/core";
import { MathPlugin } from "@mcp-decorator/plugin-math";

createStdioServer({
  name: "test-server",
  plugins: [new MathPlugin()],
});
```

## 常见问题

### 1. 权限错误

```
npm ERR! code E403
npm ERR! 403 Forbidden
```

**解决方案：**

- 确保已登录：`npm login`
- 确保有发布权限：`npm owner add <username> <package-name>`
- 使用 `--access public` 标志

### 2. 包名已存在

```
npm ERR! code E409
npm ERR! 409 Conflict
```

**解决方案：**

- 更改包名或使用作用域：`@your-scope/package-name`
- 检查是否已发布该版本

### 3. 版本冲突

```
npm ERR! code E400
npm ERR! 400 Bad Request - PUT https://registry.npmjs.org/@mcp-decorator/core
```

**解决方案：**

- 更新版本号：`npm version patch`
- 不能发布已存在的版本

### 4. 工作区依赖问题

如果插件包无法找到核心包：

```bash
# 确保核心包已发布
cd packages/core
npm publish --access public

# 等待 NPM 索引更新（约 1-2 分钟）

# 然后发布插件包
cd ../plugin-math
npm publish --access public
```

## 自动化发布

### 使用 GitHub Actions

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm test
      - run: pnpm -r publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 配置 NPM Token

1. 在 NPM 创建访问令牌：https://www.npmjs.com/settings/~/tokens
2. 在 GitHub 仓库设置中添加 Secret：`NPM_TOKEN`

## 发布清单

发布前确认：

- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] README.md 准确无误
- [ ] 文档已更新
- [ ] 已登录 NPM
- [ ] 按正确顺序发布包
- [ ] 发布后验证安装

## 回滚发布

如果需要撤销发布：

```bash
# 撤销最近 72 小时内的发布
npm unpublish @mcp-decorator/core@0.1.0

# 注意：只能撤销 72 小时内的版本
# 超过 72 小时只能发布新版本修复
```

## 维护建议

1. **定期更新依赖**：使用 `pnpm update` 更新依赖
2. **遵循语义化版本**：确保版本号反映变更类型
3. **维护 CHANGELOG**：记录每个版本的变更
4. **及时响应 Issues**：关注 GitHub Issues 和 NPM 反馈
5. **保持文档更新**：确保文档与代码同步

## 相关链接

- [NPM 文档](https://docs.npmjs.com/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [pnpm 工作区](https://pnpm.io/workspaces)
- [GitHub Packages](https://github.com/features/packages)
