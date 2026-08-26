# 内容与策展 · 课程总网站

本项目为《内容与策展》课程官方网站，基于 Vue 3、Vite 与 Cloudflare 全栈架构（Pages + Functions + D1 数据库）构建。网站整合了课程大纲、选题库、空间归属、资源中心及师生权限管理。

---

## 核心功能模块

- **课程大纲 (Syllabus)**：提供完整的 16 周教学排期、参考画廊、交互式展开视图与素材链接。
- **资源中心 (Resources)**：包含推荐文献、工具软件、教学视频与互动网站推荐，支持分类筛选及图片灯箱预览（Image Lightbox）。
- **师生验证与分组管理 (`/manage` & `/student`)**：
  - 基于 Cloudflare D1 数据库与 Cloudflare Functions 接口 (`/api/auth/`) 实现轻量化身份校验与密码管理。
  - 支持教师批量导入学员、自动/手动分组及共享邀请码逻辑。
- **空间选题与选词库**：结合 16 组选题词汇与空间载体模型，数据由 Cloudflare D1 实时提供与同步。

---

## 目录约定

标准的 Vue 3 全栈项目架构：

```text
课程总网站/
├── functions/             # Cloudflare Pages Functions 后端 API 接口 (API & Auth)
├── migrations/            # Cloudflare D1 数据库迁移脚本
├── public/                # 随网站发布的静态公开资源 (含 WebP 图片与 Icon)
├── source-assets/         # 源文件（设计源稿、高清大图、控制器 SVG 模板等）
├── src/
│   ├── components/        # UI 组件 (按 scope 划分: common, navigation, syllabus, resources 等)
│   ├── composables/       # Vue 3 组合式 API (权限 session、资源过滤、响应式状态)
│   ├── data/              # 课程内容、资源数据与静态数据配置
│   ├── router/            # 页面路由规划 (Syllabus, Resources, Manage, Student, Works 等)
│   ├── services/          # API 接口访问与状态管理 (courseState)
│   ├── views/             # 路由顶层视图页面
│   └── styles/            # 全局及页面 CSS 样式
├── scripts/               # 自动化构建辅助脚本
└── wrangler.jsonc         # Cloudflare Pages & D1 配置文件
```

---

## 本地开发与数据库配置

### 1. 安装依赖与启动本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动前端 Vite 本地开发服务器
npm run dev

# 3. 构建前端产物
npm run build
```

### 2. 数据库迁移 (Cloudflare D1)

```bash
# 本地 D1 数据库迁移测试
npm run d1:migrate:local

# 生产环境远程 D1 数据库迁移
npm run d1:migrate:remote
```

### 3. 使用 Wrangler 进行全栈本地调试

```bash
npx wrangler pages dev dist --d1 DB=REPLACE_WITH_D1_DATABASE_ID --binding ADMIN_PASSWORD=本地教师口令 --binding STUDENT_PASSWORD_PEPPER=本地测试密钥
```

> **注意**：首次部署时需创建 D1 数据库并将 ID 写入 `wrangler.jsonc`：
> ```bash
> npx wrangler d1 create content-curation-site
> ```

---

## Git 版本控制与 CI/CD

- **主分支**：`main` 对应线上生产环境。
- **自动部署**：当推送到 GitHub 远程仓库 (`git push origin main`) 时，Cloudflare Pages 将监听到 Webhook 自动触发在线构建与发布。
- **Commit 规范**：使用 `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `chore:` 等语义化前缀。

