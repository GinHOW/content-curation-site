```resource
type: website
title: The Pudding
url: https://pudding.cool/
preview: https://pudding.cool/common/assets/social/og-facebook.jpg
description: The Pudding 的数字出版与互动叙事平台。
```

```resource
type: repository
title: The Pudding 网站源码
url: https://github.com/the-pudding/website/tree/main
description: The Pudding 主站与作品索引系统的开源仓库。
```


The Pudding 可以被理解为一个非常典型、同时又极具启发性的“数字出版物 + 创意技术工作室”案例。它表面上是一个以数据可视化和视觉叙事著称的数字媒体网站，但如果进一步观察其 GitHub 仓库、网站结构、内容生产流程和商业组织方式，会发现 The Pudding 真正建立起来的并不是一个传统意义上的媒体网站，而是一整套围绕独立数字作品生产形成的系统。

这套系统至少包含三部分：作为内容入口和品牌门户的 **The Pudding 主站**、由大量独立互动项目组成的**作品生产体系**，以及承担商业项目并为编辑业务提供经济支持的 **Polygraph 工作室**。三者是技术架构、编辑机制和商业模式互相咬合之后形成的一套完整生产系统。

# 一、核心分析点：为什么每篇文章独立仓库？

## 网站不是文章容器，而是作品索引

理解 The Pudding 最关键的一步，是不要把 pudding 想象成《纽约时报》、The Verge、知乎或传统博客那种由统一 CMS 管理全部文章的网站。传统数字媒体通常采用“CMS—数据库—后端 API—统一文章模板—所有文章”的结构，文章只是同一个内容系统中的不同数据记录，而页面的表现形式主要由 CMS 和统一模板决定。The Pudding 则更接近“一个轻量级出版索引站 + 大量独立制作的互动作品 microsite + Google Docs/Sheets 编辑系统 + 静态构建部署体系”。主站负责汇总、展示和索引内容，每一个复杂 Story （具体的案例）则可以作为独立的软件项目开发。


```
                    ┌→ 独立互动项目 A
                    ├→ 独立互动项目 B
The Pudding 主站 ───┼→ 独立互动项目 C
                    ├→ 视频项目
                    ├→ 外部项目
                    └→ 客户合作项目

        ↑
Google Docs / Sheets
        ↑
编辑 / 作者 / 团队
```

换句话说，The Pudding 的主站承担的是轻量级出版门户的角色。它负责告诉读者这个出版物是谁、有哪些作品、作品之间有什么关系、如何搜索和发现内容，以及如何订阅和继续关注；真正复杂的阅读体验，则被交给每一个 Story （每个具体的案例）自己解决。

这背后对应着一个非常重要的架构判断：主站和每个故事本质上是两种不同的软件。Publication 解决的是品牌、作品索引、作者关系、搜索、内容发现、Newsletter、RSS 和用户回访等出版系统问题，而 Story 解决的是一个完全不同的问题，即“这个故事究竟应该以怎样的形式被体验”。因此，一个关于地理空间的故事可以被设计为地图，一个关于时间变化的故事可以采用滚动叙事，一个关于音乐的故事可以加入声音播放器，一个需要用户参与的数据问题可以被设计为模拟器或小游戏，Story 不需要被统一的文章模板限制。

## 主站实际上非常薄

从主站的代码结构来看，The Pudding 的核心页面并不多。其 SvelteKit 路由主要集中在首页、About、Author、Pitch、Privacy、Resources 和 RSS 等公共页面，这意味着主站承担的不是复杂的内容渲染，而主要是几个基础出版功能：内容发现、作品检索、品牌介绍、作者索引、知识资源、外部投稿以及 Newsletter、社交媒体和 RSS 分发。真正复杂的作品页面并没有被强制纳入这一套统一 route 和 article template 之中。

首页本身也更接近一个“作品数据库浏览器”，而不是传统媒体首页。它提供 Our Faves、Popular、Updating、Your Input、Video 和 Audio 等过滤方式，同时按照时间组织大量项目。搜索系统同样没有使用 Elasticsearch、Algolia 或复杂的服务器端搜索基础设施，而是生成一个 `search.csv` 文件，由浏览器加载之后完成 tokenize、筛选和匹配。

```
search.csv
↓
浏览器加载
↓
tokenize()
↓
Array.filter()
↓
显示结果
```

对于一个只有数百个高质量项目的网站而言，这种实现方式已经足够。相比之下，如果为了这种规模预先建立 PostgreSQL、Search API、Elasticsearch 和 Redis 等复杂系统，不仅没有明显收益，反而会增加部署、维护和故障处理成本。这体现出 The Pudding 技术架构中的一个重要原则：只解决已经真实存在的规模问题，而不是因为“大型正规网站通常应该这样做”就提前建立大型基础设施。

## Hub + Microsites：一个中心站与许多独立作品

The Pudding 整体上可以进一步理解为典型的 Hub + Microsites 架构。Hub 是 `pudding.cool` 主站，负责统一品牌、作者信息、搜索、作品 metadata 和内容入口；Microsites 则是真正的互动作品。对于主站而言，一个 Story 本质上只需要维护 `title`、`date`、`author`、`thumbnail`、`filters`、`URL` 等元数据，最终跳转地址甚至可以来自独立 URL，而不必通过主站自身的 route 系统生成。因此，The Pudding 主站严格来说更像一个 Story Registry，也就是作品注册表，而不是传统意义上的文章数据库。

一个具体项目可以单独存在于 GitHub 仓库中，拥有自己的 `package.json`、数据处理脚本、Svelte 组件、D3、LayerCake、Paper.js 或其他项目特有依赖，然后单独构建并发布。从开发结构来看，整体关系更接近下面的形式：

```
                    pudding.cool
                         │
               ┌─────────┴─────────┐
               │                   │
        Main Publication       Story Projects
               │                   │
         website repo          story-a repo
                                   │
                              story-b repo
                                   │
                              story-c repo
                                   │
                                  ...
```

但在读者看来，它们依然统一存在于 `pudding.cool/2025/...`、`pudding.cool/2026/...` 等路径之下。也就是说，对用户而言这是一个网站，对开发团队而言却是很多相对独立的软件项目。这个差异正是理解 The Pudding 架构的核心，也解释了为什么它能够让每一篇作品拥有完全不同的视觉、交互和技术结构，而不需要持续扩展一个越来越复杂的万能文章模板。

## 为什么独立仓库比统一文章模板更适合它

传统媒体通常强调统一 CMS 和统一 Article Template。这样做的优势是内容生产速度快、结构稳定、编辑权限清晰，但副作用也非常明显：所有故事最终都会逐渐被压缩成 CMS 已经允许的内容类型，例如标题、正文、图片、视频、引用和图表。当创作工具由 CMS 决定时，表达方式也就间接被 CMS 决定了。

The Pudding 选择了相反的方向。它并不要求所有 Story 使用同一个最终页面模板，而是把统一发生在更底层的地方，例如项目初始化方式、字体系统、基础组件、Header 和 Footer、数据读取习惯、部署方式以及常见开发工具。因此它真正维护的是一种“脚手架标准”，而不是“页面标准”。

```
              Pudding Starter
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
     Story A     Story B     Story C
        │           │           │
       D3        Canvas      Mapbox
        │           │           │
     自己设计      自己设计      自己设计
```

这种结构的关键在于，重复性的工程问题应该统一，而创意表达不应该统一。字体、项目结构、构建命令、基础组件和部署流程如果每次重新设计，只会造成浪费；但如果连 Story 的最终视觉和交互方式也被模板化，就会直接损害 The Pudding 最核心的产品价值。因此，它统一的是生产基础设施，而不是创意输出，这也是每篇作品采用独立仓库背后最重要的原因。

## Svelte、D3 与独立 Story 的技术组合

The Pudding 主站目前采用 Svelte、SvelteKit、Vite、D3、ArchieML、Style Dictionary、Bits UI、PostCSS 等工具，其具体版本会随着项目更新而变化，但整体技术逻辑相当稳定。Svelte 对这种类型的项目尤其合适，因为 The Pudding 的作品经常需要大量 scroll、animation、SVG、Canvas、chart、interaction、responsive visualization 和局部状态管理，但通常又不是一个具有复杂权限、订单、账号和后台业务逻辑的大型 SaaS 应用。因此，它需要的是接近 HTML、CSS 和 JavaScript 的直接控制能力，而不是越来越庞大的企业级应用抽象层。

典型的数据流可以被理解为“数据进入 Svelte Component，再生成 DOM、SVG 或 Canvas”。与此同时，D3 也不再像早期数据可视化项目那样全面控制 DOM，而更多负责 scale、shape、sorting、statistics 和 visualization calculation 等数学与数据工作。由此形成了一种相当成熟的现代数据可视化分工：Svelte 管界面和 DOM，D3 管数据和数学，而不是让 D3 同时承担整个页面框架。这种分工既保留了 D3 在可视化计算方面的优势，又让复杂界面的组件化、响应式状态和生命周期管理变得更加自然。

## Google Docs 和 Google Sheets 构成轻量 CMS

The Pudding 的另一个关键特征，是它没有传统意义上的生产数据库，其内容管理系统实际上由 Google Docs 和 Google Sheets 组成。Stories、Authors、Resources 和 Awards 等结构化信息可以存放在 Google Sheets 中，而首页文案、About、Privacy、Pitch 等长文本则可以来自 Google Docs。发布之前，通过 Node 脚本将这些内容拉取下来，Sheets 被导出为 CSV，Docs 则可以经过文本导出和 ArchieML 解析转换成 JSON。

```
Google Sheets
↓
CSV
↓
stories.csv

Google Docs
↓
TXT
↓
ArchieML
↓
JSON
```

于是完整的内容生产管线可以被概括为“编辑人员—Google Docs / Sheets—同步脚本—CSV / JSON—SvelteKit—静态页面”。这种方式很好地解决了编辑人员和开发人员之间的工具矛盾：编辑人员无需学习 Git、Markdown、VS Code、数据库后台或复杂 CMS，只需要继续使用熟悉的 Google Docs 和 Sheets；开发人员则不需要维护 CMS Server、数据库、Admin UI、用户认证和内容 API，最终依然能够获得结构清晰、非常容易处理的 CSV 和 JSON 文件。

## Build-time Architecture：把复杂度从运行时移到构建时

The Pudding 的整个网站还体现出非常典型的 Build-time Architecture。大量工作并不发生在用户访问网页的时候，而是在发布之前完成，例如同步 Google Docs 和 Sheets、处理图片、生成搜索索引、解析数据、构建页面以及输出最终
的 HTML、CSS 和 JavaScript。因此线上环境不需要持续承担这些计算，只需要把已经生成好的静态资源交给用户。

```
Google Docs / Sheets
↓
Node scripts
↓
数据转换
↓
图片处理
↓
搜索索引
↓
SvelteKit build
↓
静态 HTML / CSS / JS
```

这意味着代码中即使存在某些 server-side loading，也并不等于生产环境需要长期运行一个 Node.js Server。很多 server 文件承担的是构建阶段的数据获取和页面生成任务，而不是请求到达服务器之后动态执行的业务逻辑。主站最终可以通过 SvelteKit 的静态适配方式生成静态文件，再进入部署流程。这里真正值得关注的并不是“静态网站”这个标签本身，而是复杂度被有意识地移动到了发布阶段，从而让运行时变得极其简单。

## S3 + CloudFront：服务器最终退化为文件托管

The Pudding 的部署方式同样体现了这种技术哲学。整体链路可以简化为“SvelteKit—build—AWS S3—CloudFront—pudding.cool”。部署时通过 AWS CLI 将构建文件同步到 S3，再对 CloudFront 缓存进行 invalidation。因此对于绝大多数访问请求而言，线上并不需要持续运行 Django、Rails、PHP、Node Server、PostgreSQL、Docker 或 Kubernetes。

```
SvelteKit
↓
build/
↓
AWS S3
↓
CloudFront
↓
pudding.cool
```

从服务器的角度看，这个网站最终几乎只是一些文件。这种架构带来的好处非常现实：基础设施成本低，系统稳定，CDN 性能优秀，攻击面较小，维护工作较少，而且面对某篇作品突然获得大量访问时，也不容易出现传统动态后端的扩容问题。对于作品数量有限、但单篇内容访问量可能突然爆发的数字媒体来说，这是一种与业务特征高度匹配的架构，而不是为了追求技术上的“先进”而做出的选择。

# 二、编辑生产模式（运营模式）

The Pudding 的技术架构并不是孤立产生的，它背后对应着一种与传统新闻编辑部明显不同的组织方式。The Pudding 长期强调自己更接近一个 small group 和 collective，而不是严格的 hierarchical team。也就是说，它并不是通过记者、数据编辑、设计师、前端工程师和主编等角色逐层交付一个项目，而是倾向于让单个创作者或非常小的项目组拥有更完整的生产能力。

传统媒体的流程通常可以抽象为“记者—数据编辑—设计师—前端工程师—编辑”，每个专业岗位负责生产链条中的一段；The Pudding 则更接近以 Data Storyteller 或 Creative Technologist 为中心的项目结构，一个人或一个很小的团队可以同时覆盖 research、reporting、data analysis、design、writing 和 code。于是 journalist-engineer、data storyteller、creative technologist 这类混合型职业身份就成为这种组织结构中的自然结果。对于传统公司而言，这些能力通常分散在多个部门；对于 The Pudding 而言，它们反而倾向于被整合到一个创作者或小型项目组中，从而减少复杂的跨部门交付，并让作品形式可以在研究、叙事、设计和代码之间不断迭代。

## 低频、高投入、长生命周期的编辑策略

The Pudding 并不以 breaking news 或 clickbait 为核心，也不要求所有项目遵循新闻媒体常见的高频发布节奏。这不能简单理解成一种“比较佛系”的工作方式，而应该被看作不同的产品战略。传统互联网媒体的内容模型往往倾向于低到中等单篇投入、高发布频率、较短生命周期以及流量驱动，而 The Pudding 的项目更接近高投入、低频率、长寿命和高差异化。

一个关于长期文化现象、语言、音乐、饮食、人口或空间数据的问题，即使几个月后发布，也可能仍然具有价值，而且某些内容在数年之后依然可以被搜索、引用和重新传播。因此，其编辑单位不是“今天需要发布多少篇文章”，而更接近“一个问题是否值得被做成一个独特的数字作品”。一旦内容生命周期从几小时、几天延长到几年，那么投入几周乃至数月开发一篇作品就具有了完全不同的经济合理性，这也进一步解释了为什么每篇 Story 可以承担更高的设计和工程成本。

## 外部 Contributor 网络

这种生产模式又进一步延伸到了组织边界之外。The Pudding 并不只依赖内部团队制作内容，而是长期接受外部 Story Pitch，并与自由职业者、研究者、数据记者、设计师和开发者合作。一个完整的 contributor 甚至可能从头到尾负责 reporting、data analysis、design 和 front-end development，The Pudding 内部则根据具体项目提供编辑、设计、数据或工程支持。

因此其生产结构可以概括为“小型核心团队 + 外部 Contributor 网络 + 自由职业创作者 + 项目型协作者”。这种结构使 The Pudding 不需要建立几十人乃至上百人的大型新闻采编组织，却依然可以获得远超内部人数所能覆盖的选题、知识和创作能力。与这种组织方式相对应，每一个 Story 采用独立项目结构也就更加合理，因为不同项目可以拥有独立的代码仓库、依赖和开发周期，而不必将所有协作者都接入一个巨大且复杂的内部内容平台。

# 三、商业模式

如果只观察 The Pudding 的编辑网站，会立即产生一个重要问题：一个不依赖传统展示广告、不设置订阅付费墙，同时又持续投入高成本互动作品的数字出版物，如何维持长期运营？理解这个问题，需要把 The Pudding 和 Polygraph 放在一起。The Pudding 背后的团队同时运营商业数据可视化与创意技术工作室 Polygraph，两者本质上使用的是同一组核心能力，但对应不同的项目来源和经济关系。

```
             Same Creative Capability
                       │
          ┌────────────┴────────────┐
          │                         │
     THE PUDDING                POLYGRAPH
          │                         │
      Editorial                   Client
          │                         │
    自主选择问题                 客户提出问题
          │                         │
      免费发布                   商业合同
          │                         │
   品牌 / 受众 / 声誉             Revenue
          │                         │
          └────────────┬────────────┘
                       ↓
                  Sustain Team
```

从这个角度看，The Pudding 可以理解为 Editorial R&D Lab，而 Polygraph 则是 Commercial Studio。前者建立方法、品牌、声誉和创作能力，后者将这些能力转化为商业收入。两者之间并不是简单的“媒体业务 + 外包业务”，而更接近同一套专业能力在编辑环境和商业环境中的两种应用形式。

## Polygraph 真正销售的是完整的问题解决能力

Polygraph 并不是传统意义上的网页设计外包公司，也不仅仅出售数据可视化图表。其核心产品实际上是一整套从复杂问题到数字体验的转换过程：从 Problem 开始，经过 Research、Data、Analysis、Story、Visualization、Design 和 Code，最终形成可以直接用于传播的数字体验。客户购买的不是某一个页面，而是一整套将复杂信息转化为可理解、可传播、可交互数字内容的能力。

```
Problem
↓
Research
↓
Data
↓
Analysis
↓
Story
↓
Visualization
↓
Design
↓
Code
↓
Distribution-ready Digital Experience
```

这也是为什么 The Pudding 的编辑内容本身能够成为最有说服力的能力证明。传统咨询公司需要通过提案、案例册或销售资料解释“我们可以做什么”，而 The Pudding 已经通过长期公开作品持续展示团队真正能够做到什么。读者、行业人士和潜在客户看到的不是抽象能力介绍，而是一系列已经运行在真实互联网环境中的高完成度项目，因此编辑作品本身同时积累了品牌、方法论和商业可信度。

## Editorial 和 Commercial 形成商业飞轮

这种结构进一步形成一个非常清晰的商业飞轮。The Pudding 制作实验性编辑作品，作品获得读者、奖项和行业传播，从而建立专业品牌声誉；潜在客户看到这种能力之后，希望获得类似的数据叙事、视觉化和数字体验，于是进入 Polygraph 的商业项目体系；商业项目带来收入，收入继续支持核心团队和技术能力，团队由此有资源继续制作更实验性的 The Pudding 项目，新的项目又进一步强化品牌。

```
          The Pudding
    制作实验性编辑作品
               ↓
      获得读者 / 奖项 / 传播
               ↓
        建立专业品牌声誉
               ↓
     客户看到这种生产能力
               ↓
           Polygraph
               ↓
          商业项目收入
               ↓
          支撑核心团队
               ↓
     获得资源继续做 Pudding
               ↓
       做更实验性的作品
               ↓
              ...
```

因此可以说，The Pudding 的编辑内容具有某种市场营销作用，但把它简单称为“内容营销”又并不准确，因为这些作品本身并不是为了推销客户服务而生产的宣传内容，它们首先是真正独立的编辑产品。恰恰因为编辑作品具有独立性、实验性和质量，它们才能建立行业声誉，而这种声誉又自然转化为 Polygraph 的商业机会。更准确的理解是：Editorial 构成长期品牌资本，Commercial 将品牌资本和专业能力转化为收入，两者互相强化。

## 辅助收入和用户关系渠道

除了 Polygraph，The Pudding 还拥有 Patreon、Merchandise、Sponsored Projects 和 Newsletter 等辅助性的收入和关系渠道，但这些渠道的重要性并不完全相同。Patreon 更接近读者自愿支持，Merchandise 同时具有收入和品牌传播作用，Sponsored Projects 则属于受到明确区分的商业合作，Newsletter 的作用更多体现为维持读者关系和内容分发，而不是直接收入。

从公开信息来看，很难准确判断这些收入来源各自占整体收入的比例，因此并不适合简单估算。但从整个组织结构来看，Polygraph 仍然是理解 The Pudding 长期经济模式时最关键的一环，因为它把原本难以通过广告或订阅直接变现的高成本创作能力，转换成面向机构客户的高价值专业服务。

## Resources 和开源并不是额外工作

The Pudding 还有一个非常值得关注的 Resources 系统，其中长期公开数据处理、Data Visualization、Scrollytelling、D3、设计方法、Live Coding、演讲、FAQ 和其他学习资料。从短期商业逻辑看，这似乎意味着免费公开大量专业知识，但从更长期的系统角度看，它实际上形成了另一条围绕行业影响力的循环：知识公开提高 The Pudding 在开发者和设计师社区中的能见度，社区影响力又带来更多潜在人才、Contributor、Collaborator 和行业关系，而这些关系进一步增强品牌声望，并可能转化为新的商业合作。

```
Knowledge Sharing
↓
行业影响力
↓
开发者 / 设计师社区
↓
人才来源
↓
Collaborators
↓
品牌声望
↓
Client Leads
```

因此 The Pudding 的开源代码、Starter、教程和知识资源并不是核心业务之外的公益附件，而可以被理解为整个品牌基础设施的一部分。它们既降低未来协作者进入项目的门槛，又帮助塑造行业方法论，还持续吸引潜在员工、作者、合作伙伴和商业客户。

# 四、The Pudding 的五层架构

如果不再把 The Pudding 单纯看成一个“网站”，而是同时考虑技术、内容生产、受众和商业关系，可以将其整体拆分为五个层次：Audience Layer、Publication Layer、Story Layer、Production Layer 和 Business Layer。

```
┌──────────────────────────────────┐
│ 1. Audience Layer                │
│                                  │
│ Website / Social / Newsletter    │
│ RSS / Resources                  │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ 2. Publication Layer             │
│                                  │
│ pudding.cool                     │
│ Search / Story Index / Authors   │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ 3. Story Layer                   │
│                                  │
│ Independent Story Projects       │
│ D3 / Canvas / SVG / WebGL / etc. │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ 4. Production Layer              │
│                                  │
│ Google Docs / Sheets             │
│ GitHub / Starter / Node Scripts  │
│ SvelteKit / AWS / CloudFront     │
└────────────────┬─────────────────┘
                 ↓
┌──────────────────────────────────┐
│ 5. Business Layer                │
│                                  │
│ The Pudding ←→ Polygraph         │
│ Editorial     Commercial Studio  │
└──────────────────────────────────┘
```

Audience Layer 解决的是作品如何到达用户以及用户如何再次回来；Publication Layer 负责统一品牌和管理作品之间的关系；Story Layer 是真正发生创造性表达的地方；Production Layer 提供一套足够标准化、但又不过度限制创作的基础设施；Business Layer 则解决整个系统长期存在所需要的经济来源。这五层共同构成了 The Pudding，因此真正值得研究的对象不是 `pudding.cool` 这个单独网站，而是这五层之间如何彼此配合。

## 最值得借鉴的是复杂度如何被分配

如果只观察技术选型，很容易得出一个过于简单的结论：The Pudding 使用 Svelte，因此类似项目也应该使用 Svelte。但 Svelte 并不是这个案例最重要的部分，真正重要的是 The Pudding 对复杂度的分配方式。它没有为了内容编辑建立复杂 CMS，而是选择 Google Docs 和 Sheets；没有为普通内容访问建立动态后端，而是将大量工作移动到 Build Time；没有为了几百个项目建立大型搜索基础设施，而是使用 CSV 和浏览器搜索；没有建立一个万能 Article Component，而是允许 Story 成为独立项目；没有通过统一模板控制创作，而是通过 Starter Template 统一基础设施；也没有要求广告流量直接养活编辑内容，而是建立 Polygraph 这样的商业工作室。

换句话说，它不是简单追求“架构统一”，而是在判断哪些地方真正具有规模效应之后，只统一那些值得统一的部分。字体、基础组件、数据工具、开发脚手架、部署流程、品牌规范和内容 metadata 都属于重复建设价值很低的部分，因此适合标准化；而每篇 Story 的最终表达形式恰恰是最不应该被标准化的部分，因为表达差异本身就是 The Pudding 的核心产品价值。因此可以把它的架构思想概括成一句话：统一生产系统，不统一最终作品。

# 五、缺点与不足

The Pudding 的架构具有非常强的适配性，但并不是一种适合所有内容网站的万能方案。它成立的前提，是作品数量、团队规模、内容类型和商业模式都与这种结构相匹配。一旦这些条件发生变化，原本简单而优雅的设计也可能转化成新的维护成本。

## 独立 Story 会造成长期维护碎片化

当每一个项目都拥有独立仓库时，几年之后自然可能出现几十个甚至上百个代码仓库，而它们分别使用不同版本的 Svelte、D3、Node、构建工具和第三方依赖。对于仍然持续更新的项目，这种碎片化会带来明显的长期维护成本。传统统一 CMS 的优势就在这里：一旦底层模板升级，所有文章可以同时获得更新，而独立 Microsite 架构意味着某些旧项目需要单独维护，甚至最终进入“冻结但仍然在线”的状态。

因此这种架构天然更加重视作品发布时的独立性，而不是要求所有历史作品永远运行在同一个最新技术系统上。对于新闻数据库、交易系统或长期业务应用，这种态度可能难以接受；对于数字文化作品而言，却可能是一个合理的权衡，因为很多项目在完成之后本身就更接近被保存的数字出版物，而不是需要持续功能迭代的软件服务。

## Google Sheets 只适合相对轻量的内容规模

Google Docs 和 Sheets 作为轻量 CMS 非常优雅，但它并不能无限扩展。如果一个出版系统逐渐变成一万个以上内容对象、上百名编辑人员，并需要复杂权限体系、审核流程、多语言管理、实时协作发布、细粒度版本控制和大规模媒体资产管理，那么 Google Sheets 很快就会从“简单”变成“脆弱”。

The Pudding 的方案之所以合理，恰恰是因为它并不是一个每天发布数百篇文章的大型媒体集团。技术方案不能脱离规模讨论，对 The Pudding 合理的系统，并不一定适合一个大型新闻网站。反过来说，如果一个只有几百个作品的小型出版项目直接采用为大型新闻集团设计的 CMS、搜索和权限体系，也可能只是把大量精力消耗在并不存在的问题上。

## 发布流程依然依赖工程能力

即使编辑内容使用 Google Docs 和 Sheets，其正式更新与部署流程仍然会涉及 Node scripts、Git、Build 和 AWS 等开发工具。这意味着它并不是一个任何普通编辑人员都可以独立完成“一键上线”的无代码 CMS。但这里依然需要回到团队结构本身：The Pudding 的团队原本就拥有很强的开发能力，因此工程师依赖并不是一个必须消除的问题，它并没有试图解决一个自己并不存在的组织问题。

这种思路本身也具有启发性。很多团队在设计系统时会不断试图降低对专业人员的依赖，最终建立一个极其复杂的后台，让所有操作都能通过图形界面完成；但如果真正使用系统的人本身就是开发者，那么这些抽象层可能并没有实际价值。The Pudding 的选择说明，所谓“易用”必须结合实际使用者判断，而不是把“任何人无需技术背景都能操作”当成所有系统都必须追求的目标。

## 高质量生产能力非常难规模化

The Pudding 最大的限制可能反而不来自技术，而来自人才。它理想中的创作者往往需要同时理解研究、数据、叙事、设计和编程，即使不要求一个人完全掌握所有能力，也需要能够跨越多个专业领域进行协作。这种人才天然稀缺，因此 The Pudding 的组织和商业模式很难演变为“大量人员 + 高频内容生产”的工业化媒体系统。

它更自然地趋向于“小团队、高能力密度、高单项目投入、低频率、高差异化和较高商业项目单价”的结构。从这个角度看，它的“小”并不是发展不足，而可能恰恰是这种系统保持有效的重要前提。一旦组织规模变得过大，项目管理、角色分工、流程审批和跨部门协作会迅速增加，而原本依赖个人综合能力和项目自主性的生产方式反而可能遭到破坏。

# 六、总结

The Pudding 可以被定义为一个以静态出版基础设施为底层、以独立互动项目为核心内容单元、以 Google Docs 和 Google Sheets 作为轻量 CMS、以 Svelte 和 D3 等工具构建数字叙事、以 AWS S3 和 CloudFront 作为静态发布基础设施，并通过商业数据叙事工作室 Polygraph 反向支持独立 Editorial R&D 的数字出版系统。

但如果只把注意力停留在 Svelte、D3、AWS 或独立 GitHub 仓库上，仍然没有真正理解这个案例。The Pudding 最重要的问题并不是“这个网站用了什么技术”，而是“如何设计一套生产系统，使一个很小的团队能够长期制作高度定制、技术复杂、形式自由的数字作品”。当这个问题被确定之后，它的大部分技术选择都可以得到解释：之所以使用静态构建，是因为运行时并没有太多动态业务；之所以没有大型 CMS，是因为内容量有限，而编辑已经熟悉 Google Docs；之所以每篇 Story 独立，是因为每个故事的最佳表达形式不同；之所以需要 Starter，是因为创意不应该标准化，但重复性的工程工作应该标准化；之所以主站很薄，是因为 Publication 的职责只是组织和发现作品，而不是决定每一个 Story 怎样呈现；之所以拥有 Polygraph，则是因为高成本、低频率的实验性编辑内容很难单纯依赖流量广告维持，而相同的专业能力在商业市场中又具有很高价值。

因此，The Pudding 的技术架构、编辑组织和商业模式其实不是三件独立的事情，而是围绕同一个目标形成的系统。技术自由让 Story 可以选择最适合自己的形式，编辑自由让团队可以选择值得长期研究的问题，商业收入则为这种低频、高投入的生产模式提供现实支撑；反过来，高质量作品又继续积累品牌和商业价值，从而让整个系统获得继续运行的条件。

```
             技术自由
                ↑
                │
商业收入 ← 小团队 → 编辑自由
                │
                ↓
             创作自由
```

因此，The Pudding 真正值得研究的“产品”并不只是网站上已经发布的那些 Visual Essays。更深一层来看，它真正创造的是一套能够持续生产这些 Visual Essays 的系统，而 `pudding.cool` 只是这套系统面向公众显现出来的一部分。
