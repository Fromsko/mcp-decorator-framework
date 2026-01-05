---
tags:
  - prompt
  - git
  - convention
created: 2025-12-26
inclusion: no
---

# Git Commit Convention

## Format
```
<emoji> <type>: <description>
```

## Commit Types

| Emoji | Type | 用途 |
|-------|------|------|
| ✨ | feat | 新功能 |
| 🐛 | fix | Bug 修复 |
| 📝 | docs | 文档更新 |
| 🎨 | style | 代码格式 |
| ♻️ | refactor | 重构 |
| ⚡ | perf | 性能优化 |
| ✅ | test | 测试 |
| 📦 | build | 构建/依赖 |
| 👷 | ci | CI/CD |
| 🔧 | chore | 杂项 |
| ⏪ | revert | 回滚 |

## Examples
```
✨ feat: add user authentication
🐛 fix: resolve login timeout issue
📝 docs: update API documentation
🎨 style: format code with prettier
♻️ refactor: simplify user service logic
⚡ perf: optimize database queries
✅ test: add unit tests for auth module
📦 build: upgrade webpack to v5
👷 ci: add GitHub Actions workflow
🔧 chore: update dependencies
⏪ revert: remove deprecated feature
```

## Guidelines
- Keep the description concise and clear
- Use imperative mood (e.g., "add" not "added")
- Limit the first line to 50 characters
- Reference issues in the description if applicable
