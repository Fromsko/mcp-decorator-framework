# 插件开发工作流

新建插件到发布的完整流程。

## 1. 创建插件目录

```bash
mkdir packages/plugin-<name>
mkdir packages/plugin-<name>/src
```

## 2. 初始化 package.json

```json
{
  "name": "@mcp-decorator/plugin-<name>",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@mcp-decorator/core": "workspace:*"
  },
  "peerDependencies": {
    "zod": "^3.24.1"
  }
}
```

## 3. 配置 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 4. 实现插件

```typescript
// src/index.ts
import {
  Command,
  Param,
  type MCPResponse,
  type Plugin,
} from "@mcp-decorator/core";
import { z } from "zod";

@Command("<name>.action", "Description")
class MyCommand {
  @Param(z.string().describe("Parameter description"))
  param!: string;

  async execute(params: { param: string }): Promise<MCPResponse> {
    return {
      content: [{ type: "text", text: `Result: ${params.param}` }],
    };
  }
}

export class MyPlugin implements Plugin {
  name = "<name>";
  version = "0.1.0";

  async init() {}
  register() {
    return [MyCommand];
  }
  async destroy() {}
}
```

## 5. 集成到项目

### 5.1 更新根 tsconfig.json

```json
{
  "references": [{ "path": "./packages/plugin-<name>" }]
}
```

### 5.2 更新 scripts/bump-version.js

```javascript
const packages = {
  // ...existing
  "<name>": "packages/plugin-<name>/package.json",
};

// syncCoreDeps 数组添加 '<name>'
```

### 5.3 更新 Makefile

```makefile
# Package paths 添加
<NAME>_PKG := packages/plugin-<name>/package.json

# help/version 输出添加
@echo "  <name>     -> $$(node -p \"require('./$(NAME_PKG)').version\")"

# Available Packages 添加 <name>
```

### 5.4 更新 .github/workflows/publish.yml

```yaml
- name: 🚀 发布 <Name> 插件
  if: steps.version.outputs.changed == 'true'
  run: |
    cd packages/plugin-<name>
    pnpm publish --access public --no-git-checks
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Release body 添加包链接。

## 6. 更新文档

| 文件                         | 更新内容                   |
| ---------------------------- | -------------------------- |
| `README.md`                  | 官方插件表格               |
| `docs/PUBLISH_CHECKLIST.md`  | 包配置、构建产物、NPM 链接 |
| `docs/plugin-development.md` | 示例插件列表               |

## 7. 构建验证

```bash
pnpm install
pnpm build --filter=@mcp-decorator/plugin-<name>
```

## 8. 发布

```bash
make up-all patch  # 或 minor/major
git add .
git commit -m 'feat: add plugin-<name>'
git push
```

GitHub Actions 自动发布。

## Checklist

- [ ] package.json 配置正确
- [ ] tsconfig.json 继承项目配置
- [ ] 实现 Plugin 接口
- [ ] 根 tsconfig.json references
- [ ] bump-version.js packages 对象
- [ ] Makefile 包路径和输出
- [ ] publish.yml 发布步骤
- [ ] README.md 插件表格
- [ ] PUBLISH_CHECKLIST.md
- [ ] plugin-development.md 示例
- [ ] 构建通过
