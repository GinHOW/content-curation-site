export const courseInfo = {
  name: '内容与策展',
  nameEn: 'Content & Curation',
  cycle: '8 周，每周 3 次课',
  duration: '每次课 2–3 学时',
  audience: '三年级',
  output: '策展网站',
  format: '策展网站为个人独立完成；展览方案可 2–3 人小组合作',
  description: `本课程围绕"内容如何被采集、组织、构建为可公开访问的策展网站"这一核心问题展开。学生将从网络中采集内容、进行策展分析与叙事设计，最终通过 vibe coding（AI 辅助编程）的方式，使用 React 或 Vue 框架搭建一个完整的策展网站。`,
  objectives: [
    '理解"策展"的方法论框架——采集、筛选、组织、呈现的完整链条',
    '掌握网络内容采集的基本方法（网页爬取、多源采集、数据整理）',
    '具备内容分析与叙事设计能力，能将散乱素材转化为有逻辑的策展内容',
    '理解前端代码的基本结构（HTML/CSS/JS + React/Vue 组件），能读懂和修改 AI 生成的代码',
    '熟练使用 vibe coding 工作流（AI 辅助编码）进行 React/Vue 网站开发',
    '掌握空间展具设计的基本方法——将策展内容转化为物理展览空间',
    '在团队中协作完成从采集到上线的策展网站项目',
    '了解网站发布、运营与可持续维护的基本方法',
  ],
}

// 开课日期：2026年9月7日（周一），每周一、三、四上课
const startDate = new Date(2026, 8, 7) // month is 0-indexed

function getWeekDates(weekIndex) {
  const mon = new Date(startDate)
  mon.setDate(mon.getDate() + weekIndex * 7)
  const wed = new Date(mon)
  wed.setDate(wed.getDate() + 2)
  const thu = new Date(mon)
  thu.setDate(thu.getDate() + 3)
  return { mon, wed, thu }
}

function fmt(d) {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export const weeks = [
  {
    week: 1,
    phase: 1,
    title: '导论：策展与 Vibe Coding',
    sessions: [
      {
        type: 'Session A · 讲授',
        title: '什么是策展 + Vibe Coding 介绍 + 课程介绍',
        points: [
          '"策展"（curation）的词源与演变：从博物馆策展到数字内容策展',
          '策展的核心动作：采集→筛选→组织→呈现',
          '什么是 Vibe Coding：AI 辅助编码的工作流与理念',
          '课程结构、产出要求、评分方式说明',
          '往届课程成果回顾',
        ],
      },
      {
        type: 'Session B · 讨论',
        title: '初探网页代码 + 环境搭建 + Vibe Coding 初体验',
        points: [
          '代码快过（30 分钟）：HTML/CSS/JS/React 组件——核心概念一览',
          '安装开发环境：Cursor / VS Code、Git、Node.js、浏览器开发者工具',
          '注册 GitHub 账号',
          'Vibe Coding 初体验：用 AI 在 5 分钟内生成一个"关于我"页面',
          '演示完整循环：描述需求→AI 生成代码→预览→修改→再迭代',
        ],
      },
      {
        type: 'Session C · 汇报',
        title: '自我介绍 + Vibe Coding 反馈',
        points: [
          '每人 1 分钟结合自己做的页面，简单自我介绍',
          'Vibe Coding 初体验反馈',
          '开放讨论：对 AI 辅助编码的期待与担忧',
        ],
      },
    ],
    homework: [
      '用 AI 辅助搭建一个"关于我"的简单页面',
      '记录你的 Vibe Coding 初体验中的 3 个发现',
      '每人从候选列表中选择 1 个意向策展对象',
    ],
  },
  {
    week: 2,
    phase: 1,
    title: '数据集1：数据采集 + 空间展具（一）',
    sessions: [
      {
        type: 'Session A · 讲授',
        title: '网页结构与数据采集',
        points: [
          '回顾学生作业中的"关于我"页面',
          '网页结构：HTML DOM 树、CSS 选择器',
          '网络爬虫基本原理：请求→响应→解析→存储',
          '多源采集策略',
          '伦理与版权：爬虫的合法边界',
        ],
      },
      {
        type: 'Session B · 实验',
        title: '数据采集实操',
        points: [
          '工具选择：浏览器开发者工具、Python/JS 爬虫、无代码浏览器插件',
          'AI 辅助爬虫开发：用 vibe coding 生成爬虫脚本',
          '动手爬取：爬取与所选对象相关的文本、图片、数据',
          '数据清洗：去重、格式统一、元数据标注',
          '建立结构化的"对象素材库"',
        ],
      },
      {
        type: 'Session C · 项目工作坊',
        title: '空间展具概念引入 + 组队',
        points: [
          '空间展具概念介绍',
          '案例：展览中的展具设计',
          '组建 2–3 人小组，讨论组内分工方向',
          '初步讨论：如果策展对象放在真实物理空间里，怎么呈现？',
        ],
      },
    ],
    homework: [
      '完成"对象素材库"（至少 30 条有效条目，含元数据）',
      '初步思考空间展具概念：画草图或写一段描述',
    ],
  },
  {
    week: 3,
    phase: 1,
    title: '数据集2：从数据到叙事 + 空间展具（二）',
    sessions: [
      {
        type: 'Session A · 讲授',
        title: '策展叙事的设计',
        points: [
          '内容分析方法：主题分析、编码、聚类',
          '策展叙事模式：线性 vs. 非线性、主题式 vs. 时间线 vs. 地图式',
          '数据库式策展、多维导航、随机存取',
          '案例研究：优秀的数字策展项目',
          'AI 辅助内容分析：用 AI 做主题聚类和叙事角度发散',
        ],
      },
      {
        type: 'Session B · 工作坊',
        title: '案例分析与叙事原型',
        points: [
          '分析具体数字策展项目的叙事结构',
          '用 AI 辅助对素材库进行主题聚类和叙事角度发散',
          '原型复刻练习：设计自己的叙事框架',
        ],
      },
      {
        type: 'Session C · 项目工作坊',
        title: '策展概念定稿 + 空间展具方案讨论',
        points: [
          '每人/每组撰写 500 字策展概念说明',
          '绘制网站信息架构草图',
          '收集 3–5 个视觉设计参考（moodboard）',
          '空间展具：小组讨论展具方案',
        ],
      },
    ],
    homework: [
      '提交策展概念说明 + 信息架构草图 + 视觉参考',
      '【第一阶段检查点】每人用 3 分钟汇报策展方向与进度',
      '空间展具方案初步：平面布局草图 + 200 字说明',
    ],
  },
  {
    week: 4,
    phase: 1,
    title: '网站设计1：网页整体结构设计',
    sessions: [
      {
        type: 'Session A · 讲授',
        title: '网站结构设计与项目规划',
        points: [
          '网站数据结构设计：内容模型、数据与呈现的分离',
          '前端项目管理：后期长期运营，内容如何便捷更新上传',
          'React/Vue 项目结构规划：组件拆分、路由设计、状态管理策略',
          'Demo：教师演示策展网站的数据结构和项目搭建过程',
        ],
      },
      {
        type: 'Session B · 实验',
        title: '案例分析与原型复刻',
        points: [
          '分析优秀策展网站的信息架构与技术实现',
          '用 Vite 搭建 React/Vue 项目骨架',
          '组件规划：根据线框图拆分组件树',
        ],
      },
      {
        type: 'Session C · 项目工作坊',
        title: '设计评审',
        points: [
          '各组/个人展示线框图，集体讨论改进方案',
          '确定技术方案',
          '搭建项目文件结构（Vite 脚手架）',
          '空间展具：小组推进展具方案深化',
        ],
      },
    ],
    homework: [
      '完成网站全部页面的线框图定稿',
      '搭建 React/Vue 项目文件结构，推送到 GitHub',
      '空间展具：完成展具制作方案',
    ],
  },
  {
    week: 5,
    phase: 2,
    title: '网站设计2：Vibe Coding 搭建 + 空间展具（三）',
    sessions: [
      {
        type: 'Session A · 讲授+演示',
        title: '用 Vibe Coding 搭建 React/Vue 网站',
        points: [
          '演示完整的 vibe coding 建站流程',
          '代码组织最佳实践：组件目录、命名规范、CSS 方案',
          '调试方法论：浏览器开发者工具、如何向 AI 有效描述 bug',
        ],
      },
      {
        type: 'Session B · 实验',
        title: '搭建首页与内容页组件',
        points: [
          '用 vibe coding 搭建网站的首页框架',
          '搭建一个内容页模板组件',
          '重点：理解 AI 生成的每一行代码',
          '代码审查：教师巡回确认学生理解代码结构',
        ],
      },
      {
        type: 'Session C · 项目工作坊',
        title: '内容填入 + 空间展具方案展示',
        points: [
          '将策展内容填入页面组件',
          '处理图文关系',
          '空间展具：小组展示展具设计方案',
          '教师巡回指导',
        ],
      },
    ],
    homework: [
      '完成首页和至少 2 个内容页的搭建',
      '记录 3 个"AI 生成的代码我做了修改"的地方',
      '空间展具：开始制作展具',
    ],
  },
  {
    week: 6,
    phase: 2,
    title: '网站设计3：交互与可视化 + 空间展具（四）',
    sessions: [
      {
        type: 'Session A · 讲授',
        title: '响应式设计 + 数据可视化叙事',
        points: [
          '响应式设计原理',
          '数据可视化基础',
          '交互叙事（scrollytelling）',
          '工具选择：Chart.js / D3.js / Flourish / DataWrapper',
        ],
      },
      {
        type: 'Session B · 实验',
        title: '交互组件 + 可视化组件开发',
        points: [
          '用 vibe coding 开发常用交互组件',
          '用 vibe coding 开发数据可视化组件',
          '重点：可视化必须与策展叙事相关',
        ],
      },
      {
        type: 'Session C · 项目工作坊',
        title: '网站交互集成 + 空间展具制作',
        points: [
          '为网站添加至少 2 个交互功能 + 1 个可视化组件',
          '测试移动端显示效果',
          '空间展具：小组继续制作展具',
          '代码审查：教师抽查',
        ],
      },
    ],
    homework: [
      '网站包含完整的响应式适配、交互功能、数据可视化元素',
      '可视化内容与策展主题直接相关',
      '空间展具：完成展具制作',
    ],
  },
  {
    week: 7,
    phase: 2,
    title: '网站发布 + 空间展具',
    sessions: [
      {
        type: 'Session A · 讲授',
        title: '网站发布 + 展陈设计',
        points: [
          '网站发布：域名、主机/托管、DNS、HTTPS 基础',
          '静态网站部署方案',
          '展陈设计要素',
          '图文版式设计',
        ],
      },
      {
        type: 'Session B · 实验',
        title: '发布工作坊 + 空间展具布置',
        points: [
          '每人/每组完成网站的正式上线部署',
          '自定义域名配置（可选）',
          '测试：多设备、多浏览器兼容性测试',
        ],
      },
      {
        type: 'Session C · 项目工作坊',
        title: '展览方案评审',
        points: [
          '各组/个人展示完整展览方案',
          '集体评审：展具设计是否体现策展主题',
          '讨论：展具与网站内容的对应关系',
          '网站维护基础',
        ],
      },
    ],
    homework: [
      '【阶段性产出提交】策展网站 v1.0',
      '策展概念说明文档',
      '空间展具方案终稿',
    ],
  },
  {
    week: 8,
    phase: 2,
    title: '整合、运营与收尾',
    sessions: [
      {
        type: 'Session A · 讲授',
        title: '内容编辑 + 网站运营 + 展览运营',
        points: [
          '内容编辑策略',
          '图文关系',
          '网站运营基础',
          '展览运营',
        ],
      },
      {
        type: 'Session B · 工作坊',
        title: '网站与展览整合',
        points: [
          '重新审视网站：从展览的视角审视信息架构',
          '重新审视展览方案：网站可以作为展览的什么角色？',
          '将空间展具设计整合进网站',
          '线上—线下的互补逻辑',
        ],
      },
      {
        type: 'Session C · 项目工作坊',
        title: '终稿 + 课程总结',
        points: [
          '各组/个人通过网站进行现场导览',
          '集体评审',
          '整理课程所有产出',
          '课程评价与反馈',
        ],
      },
    ],
    homework: [
      '网站终稿锁定',
      '展览方案终稿提交',
      '简要运营方案',
    ],
  },
].map(w => {
  const { mon, wed, thu } = getWeekDates(w.week - 1)
  w.dates = {
    mon: fmt(mon),
    wed: fmt(wed),
    thu: fmt(thu),
  }
  return w
})

export const grading = {
  overview: [
    { item: '课堂参与', weight: '15%', desc: '出勤（5%）+ 课堂讨论与工作坊参与度（5%）+ 过程文档（5%）' },
    { item: '阶段性作业', weight: '20%', desc: '每周课后作业的完成质量' },
    { item: '策展网站', weight: '45%', desc: '内容质量（15%）+ 设计水平（10%）+ 技术完成度（10%）+ 代码理解（10%）' },
    { item: '展览方案（含空间展具）', weight: '20%', desc: '展具设计逻辑（8%）+ 方案可行性（5%）+ 线上—线下关联（7%）' },
  ],
  website: [
    { dimension: '内容质量', weight: '15%', standard: '策展主题明确、叙事线索清晰、内容来源可靠、素材丰富度' },
    { dimension: '设计水平', weight: '10%', standard: '视觉品质、信息架构合理性、排版与图文关系、响应式适配' },
    { dimension: '技术完成度', weight: '10%', standard: '网站功能完整、交互流畅、已上线可访问、无明显 bug' },
    { dimension: '代码理解', weight: '10%', standard: '能解释关键代码逻辑、能说明对 AI 生成代码做了哪些修改及原因' },
  ],
  exhibition: [
    { dimension: '展具设计逻辑', weight: '8%', standard: '展具设计是否体现策展主题、空间布局是否合理、参观体验是否连贯' },
    { dimension: '方案可行性', weight: '5%', standard: '预算、材料、空间尺度是否现实可操作' },
    { dimension: '线上—线下关联', weight: '7%', standard: '实体展具与网站内容的呼应程度、是否形成互补而非简单复制' },
  ],
}

export const candidates = [
  { object: '绳结', direction: '结构技术、文化隐喻、社会关系、结绳记事' },
  { object: '假发', direction: '身份符号、权力结构、审美变迁、当代表达' },
  { object: '棋盘/棋子', direction: '博弈思维、造型美学、杜尚、跨文化比较' },
  { object: '邮轮', direction: '移动社会、旅行文化、空间设计、产业生态（教师示范对象）' },
  { object: '镜子', direction: '自我认知、光学技术、艺术装置、文化象征' },
  { object: '钥匙', direction: '安全与权限、锁具技术、隐喻系统、城市变迁' },
]
