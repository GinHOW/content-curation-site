# 文章资源块

文章 Markdown 使用 `index.md` 作为中文正文，使用可选的 `en.md` 作为英文正文。文章页标题和其他文章级元信息来自全局资源注册表；正文目录从 Markdown 标题自动生成。

标题层级约定为：`#` 是可展开的章节，`##` 是章节下的子目录，`###` 及以下是正文内部标题，不进入左侧目录。标题会自动生成页面锚点，同名标题会追加序号。

文章 Markdown 使用 `resource` 代码块声明需要展示为卡片的外部资源。普通 Markdown 链接不会自动升级为卡片。

```markdown
```resource
type: website
title: CERN World Wide Web Project
url: https://info.cern.ch/hypertext/WWW/TheProject.html
preview: images/cern-world-wide-web-project.jpg
description: 可选的补充说明
```
```

`type` 支持 `website`、`repository` 和 `video`。`url` 必须是 HTTP(S) 地址；`title`、`preview`、`description` 和 `alt` 可以省略，渲染器会从统一资源数据中回退补全。文章目录中的相对预览图从 `images/` 开始书写。

YouTube 与 Bilibili 会生成不自动播放的内嵌播放器。其他视频地址会生成带外链按钮的普通视频卡片。资源块字段只使用单行值，字段名不区分大小写。
