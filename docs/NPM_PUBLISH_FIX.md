# NPM 发布修复清单

## ✅ 已完成的修复

### 1. GitHub Actions 工作流修复

- ✅ 添加 `scope: "@mcp-decorator"` 到 setup-node 配置
- ✅ 为所有发布步骤添加 `NODE_AUTH_TOKEN` 环境变量
- ✅ 移除手动 npm config 配置（使用官方标准方式）

### 2. Package.json 配置修复

- ✅ `packages/core/package.json` - 添加 `publishConfig.access: "public"`
- ✅ `packages/plugin-math/package.json` - 添加 `publishConfig.access: "public"`
- ✅ `packages/plugin-filesystem/package.json` - 添加 `publishConfig.access: "public"`
- ✅ `packages/plugin-http/package.json` - 添加 `publishConfig.access: "public"`

## 🔑 需要你手动完成的步骤

### 1. 更新 NPM Token

1. 登录 [npmjs.com](https://www.npmjs.com)
2. 前往 [Access Tokens](https://www.npmjs.com/settings/~/tokens)
3. 生成新的 **Classic Token**，类型选择 **Automation**
4. 复制生成的 Token

### 2. 更新 GitHub Secret

1. 前往你的 GitHub 仓库
2. Settings → Secrets and variables → Actions
3. 找到 `NPM_TOKEN` secret（如果没有就创建）
4. 更新为刚才生成的新 Token

### 3. 确认 NPM Organization

1. 访问 [npmjs.com](https://www.npmjs.com)
2. 确认你已创建名为 `mcp-decorator` 的 Organization
3. 如果没有，点击头像 → Add Organization → 创建 `mcp-decorator`
4. 确保你是该组织的成员且有发布权限

## 🚀 测试发布

完成上述步骤后，你可以：

### 方式 1: 触发自动发布

```bash
# 更新版本号（会触发自动发布）
npm version patch  # 或 minor/major
git push
```

### 方式 2: 手动触发工作流

1. 前往 GitHub Actions 页面
2. 选择 "🚀 发布到 NPM" 工作流
3. 点击 "Run workflow"

### 方式 3: 本地测试（不实际发布）

```bash
# 构建所有包
pnpm run build

# 测试发布（dry-run）
cd packages/core
npm publish --dry-run --access public
```

## 📝 关键改进说明

1. **Token 传递方式**: 使用 `NODE_AUTH_TOKEN` 环境变量，这是 `actions/setup-node` 的标准方式
2. **Scope 配置**: 在 setup-node 中明确指定 `scope: "@mcp-decorator"`
3. **Public 访问**: 所有 package.json 都添加了 `publishConfig.access: "public"`，确保免费账户可以发布

## ⚠️ 常见问题

### Q: 仍然提示 404？

A: 确认 `mcp-decorator` Organization 已创建且你是成员

### Q: Token 权限不足？

A: 确保生成的是 **Automation** 类型的 Token，不是 Read-only

### Q: 发布顺序问题？

A: Core 包会先发布，然后等待 60 秒让 NPM 索引更新，再发布插件包

## 📚 参考文档

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions setup-node](https://github.com/actions/setup-node)
- [NPM Scoped Packages](https://docs.npmjs.com/cli/v10/using-npm/scope)
