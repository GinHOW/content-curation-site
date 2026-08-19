# 内容与策展 · 课程总网站

本网站的选题库、空间归属和 16 组选词由 Cloudflare D1 统一提供。课程表 JSON 只保存静态教学内容。

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
