---
inclusion: no # fileMatch
# fileMatchPattern: "**/*.ts"
---

# Hono 开发规范

## Context 常用方法

- `c.json()` 返回 JSON
- `c.text()` 返回文本
- `c.req.param('id')` 路径参数
- `c.req.query('q')` 查询参数
- `c.req.json()` 解析 JSON body
- `c.set()/get()` 请求级变量传递

## 中间件模式

```typescript
app.use("*", async (c, next) => {
  // 前置逻辑
  await next();
  // 后置逻辑
});
```

## 错误处理

- `app.notFound()` 处理 404
- `app.onError()` 全局异常捕获

## 参考

详见 #[[file:docs/Hono-Framework-Guide.md]]
