# 内容与策展 · 课程总网站

本网站的选题库、空间归属和 16 组选词由 Cloudflare D1 统一提供。课程表 JSON 只保存静态教学内容。

## 目录约定

这是一个标准的 Vue/Vite 前端结构：

- `src/views` 存放带路由的完整页面。
- `src/components` 按使用范围存放通用、导航、首页、课程、日历和展览组件。
- `src/data` 存放课程内容与静态数据，`src/composables` 存放 Vue 组合式逻辑。
- `src/services` 存放接口访问，`src/router` 存放页面路由，`src/styles` 存放全局和页面样式。
- `public/assets` 存放随网站发布的静态素材；`course-gifs` 保持原路径以对应 R2 对象。
- `source-assets` 存放不直接发布的原图、设计源文件和控制器热区源 SVG。

控制器热区由 `scripts/generate-controller-screen-zones.mjs` 根据
`source-assets/spatial-controller/screens` 中的 SVG 生成，修改源图后重新运行生成脚本即可。

## 本地开发

```bash
npm install
npm run build
npm run d1:migrate:local
npx wrangler pages dev dist --d1 DB=REPLACE_WITH_D1_DATABASE_ID --binding ADMIN_PASSWORD=本地教师口令 --binding STUDENT_PASSWORD_PEPPER=本地测试密钥
```

首次部署时先创建数据库，并将返回的 ID 写入 `wrangler.jsonc`：

```bash
npx wrangler d1 create content-curation-site
```

数据库 ID 已写入 `wrangler.jsonc`，然后执行远程迁移：

```bash
npm run d1:migrate:remote
```

生产 Pages 项目需要绑定名为 `DB` 的 D1 数据库，并在 Variables/Secrets 中设置 `ADMIN_PASSWORD` 与 `STUDENT_PASSWORD_PEPPER`。教师管理入口为 `/manage`，学生入口为 `/student`；公开页面只读，主页和课程详情都读取 `/api/course-state`。

教师在管理入口粘贴 Excel 的“学号、姓名”两列，确认后创建学生账号。新账号初始密码为学号后六位，学生首次登录会提示修改密码，也可以先跳过，之后随时修改。教师可以直接分组，也可以为小组生成共享邀请码；邀请码在小组达到 3 人或教师撤销后失效。学生可以退出当前小组，重新加入时需要新的有效邀请码。
