# 故障排查指南

## GitHub Actions 发布问题

### 1. pnpm lockfile 不同步

**错误信息：**

```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile"
specifiers in the lockfile don't match specs in package.json
```

**原因：** package.json 中依赖版本格式不一致（`"zod": "3.25.76"` vs `"zod": "^3.25.76"`）

**解决方案：**

```bash
# 本地更新 lockfile
pnpm install

# 提交更新
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"

# 修改 workflow 使用 --no-frozen-lockfile
pnpm install --no-frozen-lockfile
```

### 2. 版本检测路径错误

**问题：** workflow 检测 `packages/core/package.json` 而非根目录版本

**解决方案：** 修改版本检测脚本

```bash
# 错误：检测子包
OLD=$(git show HEAD^:packages/core/package.json ...)

# 正确：检测根目录
OLD=$(git show HEAD^:package.json ...)
```

### 3. Monorepo 发布顺序

**关键点：**

1. 先发布 core 包（被其他包依赖）
2. 等待 60 秒让 NPM 索引更新
3. 再发布 plugin 包（依赖 core）

**发布流程：**

```bash
cd packages/core && npm publish
sleep 60
cd ../plugin-math && npm publish
cd ../plugin-filesystem && npm publish
cd ../plugin-http && npm publish
```

## 本地开发问题

### TypeScript 编译错误

**问题：** `CommandClass` 类型定义不匹配

**解决方案：**

```typescript
// 修正类型定义
type CommandClass = new (...args: any[]) => {
  execute(params: any): Promise<any>;
};
```

### 测试配置

**问题：** tsconfig.json 缺少 `include` 字段导致测试文件未编译

**解决方案：**

```json
{
  "include": ["src/**/*"]
}
```

## NPM 发布检查

发布前确认：

- ✅ 所有包版本号一致
- ✅ lockfile 已更新
- ✅ 构建成功（`pnpm run build`）
- ✅ 测试通过（`pnpm test`）
- ✅ NPM_TOKEN 已配置
