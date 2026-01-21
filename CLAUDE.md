# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen 是一个基于 AI 的 React 组件生成器,支持实时预览。使用 Claude AI 生成 React 组件,并通过虚拟文件系统在浏览器中实时渲染,无需将文件写入磁盘。

## 核心架构

### 虚拟文件系统 (Virtual File System)

- **实现位置**: [src/lib/file-system.ts](src/lib/file-system.ts)
- **核心类**: `VirtualFileSystem`
- 项目中所有生成的组件文件都存储在内存中的虚拟文件系统,而不是真实文件系统
- 文件系统状态序列化后存储在数据库的 `Project.data` 字段中
- 每次请求时从序列化数据重建文件系统实例: `fileSystem.deserializeFromNodes(files)`

### AI 工具链 (AI Tools)

项目为 AI 提供了两个核心工具来操作虚拟文件系统:

1. **str_replace_editor** ([src/lib/tools/str-replace.ts](src/lib/tools/str-replace.ts))
   - 支持命令: `view`, `create`, `str_replace`, `insert`
   - 用于查看、创建和编辑文件

2. **file_manager** ([src/lib/tools/file-manager.ts](src/lib/tools/file-manager.ts))
   - 支持文件和目录的管理操作(删除、重命名等)

### 请求流程

1. 用户发送消息 → [src/app/api/chat/route.ts](src/app/api/chat/route.ts)
2. 从数据库加载项目数据,重建 `VirtualFileSystem`
3. 调用 Vercel AI SDK 的 `streamText`,传入虚拟文件系统绑定的工具
4. AI 使用工具在虚拟文件系统中创建/修改文件
5. `onFinish` 回调中将更新后的文件系统和消息历史保存回数据库

### Mock Provider

- **实现位置**: [src/lib/provider.ts](src/lib/provider.ts)
- 当 `ANTHROPIC_API_KEY` 未配置时,使用 `MockLanguageModel` 返回预设的静态组件代码
- Mock provider 模拟了多步骤的工具调用流程,生成 Counter/Form/Card 等预设组件

### 数据库 Schema

- **Prisma Schema**: [prisma/schema.prisma](prisma/schema.prisma)
- 使用 SQLite 数据库
- Prisma Client 生成到 `src/generated/prisma` 目录

**关键模型:**

1. **User 模型**
   - 使用 CUID 作为主键
   - `email` 字段有唯一索引,支持邮箱登录
   - `password` 存储 bcrypt 哈希值
   - 与 Project 一对多关系,支持级联删除

2. **Project 模型**
   - `userId` 可为空 - 核心设计,支持匿名用户创建临时项目
   - `messages` (String/JSON) - 存储完整的 AI 对话历史
   - `data` (String/JSON) - 存储虚拟文件系统的序列化状态
   - 匿名项目在用户登录后可转换为持久化项目

**数据流转:**
- 虚拟文件系统通过 `VirtualFileSystem.serializeToNodes()` 序列化为 JSON
- 序列化数据存储在 `Project.data` 字段
- 加载时通过 `fileSystem.deserializeFromNodes(JSON.parse(data))` 重建

### 认证系统

**架构分层:**

1. **核心层** - [src/lib/auth.ts](src/lib/auth.ts)
   - 使用 JWT (jose) 进行会话管理,有效期 7 天
   - `createSession()` - 创建 JWT 并存储在 httpOnly cookie 中
   - `getSession()` - 验证并读取当前会话
   - `verifySession()` - 中间件使用,验证请求的 token
   - 安全特性: `httpOnly` (防 XSS), `secure` (生产环境 HTTPS only), `sameSite: "lax"` (防 CSRF)

2. **业务逻辑层** - [src/hooks/use-auth.ts](src/hooks/use-auth.ts)
   - `handlePostSignIn()` - 登录后的智能路由逻辑:
     - 检查是否有匿名工作 → 转换为持久化项目
     - 否则跳转到最近的项目
     - 没有项目则自动创建新项目
   - `signIn()` / `signUp()` - 封装认证流程和加载状态

3. **UI 层** - [src/components/auth/AuthDialog.tsx](src/components/auth/AuthDialog.tsx)
   - 统一的登录/注册对话框
   - 支持 `signin` / `signup` 模式切换

**匿名用户支持:**
- 匿名用户工作量追踪: [src/lib/anon-work-tracker.ts](src/lib/anon-work-tracker.ts)
- 使用 `localStorage` 存储匿名用户的对话和文件系统状态
- 登录后自动将匿名工作转换为数据库中的持久化项目 (`Project.userId` 从 null 更新为用户 ID)
- 保证用户不会丢失试用期间的工作内容

## 常用命令

### 开发环境

```bash
# 开发模式(使用 Turbopack)
npm run dev

# 后台运行开发服务器
npm run dev:daemon

# 访问地址: http://localhost:3000
```

### 数据库操作

```bash
# 完整设置(安装依赖 + 生成 Prisma Client + 运行迁移)
npm run setup

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 重置数据库
npm run db:reset
```

### 测试

```bash
# 运行所有测试(使用 Vitest)
npm test

# 运行特定测试文件
npx vitest run src/components/chat/__tests__/Chat.test.tsx
```

### 构建和部署

```bash
# 生产构建
npm run build

# 启动生产服务器
npm start

# Lint 检查
npm run lint
```

## 重要约定

### 导入路径

- 项目使用 TypeScript path mapping,`@/` 映射到 `src/` 目录
- 示例: `import { VirtualFileSystem } from "@/lib/file-system"`

### 组件生成流程

AI 生成组件时的典型步骤:
1. 使用 `str_replace_editor` 的 `create` 命令创建组件文件(如 `/components/Button.jsx`)
2. 使用 `str_replace` 命令优化或修改组件
3. 创建 `App.jsx` 来展示组件

### 环境变量

**必需配置:**
```bash
# .env 文件
ANTHROPIC_API_KEY=sk-ant-xxx  # Claude API 密钥
JWT_SECRET=your-random-secret   # JWT 签名密钥(生产环境必须配置强随机值)
```

**降级机制:**
- 如果 `ANTHROPIC_API_KEY` 未配置,系统自动降级到 Mock Provider
- Mock Provider 返回预设的静态组件(Counter/Form/Card 等)

**安全警告:**
- 开发环境 JWT_SECRET 默认为 `"development-secret-key"`,生产环境务必替换为强随机密钥
- 生成方式: `openssl rand -base64 32`

### Prisma Client 位置

- **重要**: Prisma Client 生成位置为 `src/generated/prisma`,而非默认的 `node_modules/.prisma/client`
- 导入方式: `import { prisma } from "@/lib/prisma"`

## 技术栈关键点

- **Next.js 15**: 使用 App Router,服务端组件和客户端组件混合
- **React 19**: 使用最新的 React 特性
- **Tailwind CSS v4**: 样式系统
- **Vercel AI SDK**: 处理 AI 流式响应和工具调用
- **Babel Standalone**: 在浏览器中编译和运行生成的 JSX 代码(用于预览)
- **Monaco Editor**: 代码编辑器组件
