# 场地三维模型模块 (Spatial Model System)

本目录承载了网站的核心三维空间交互系统，包括：
- 控制台中央屏幕内置的 3D 视口；
- 3D 轴测总览 ⇄ 3D 室内第一人称碰撞漫游两态自由流转；
- 极地白模（Arctic Mode）线框渲染管线；
- GLB 资产多线程并发静默预加载与动态 DPR 性能调度；
- 镜头机位标定与图层调试。

---

## 1. 架构全景图

整个三维系统采用严格的分层架构设计：

```
[配置层]       src/data/spatialModelConfig.js (资产路径/机位预设/物理常量)
                     │
[算法工具层]   src/utils/spatial-model/
               ├── materials.js        (材质赋予/白模生成/热区外观)
               ├── lighting.js         (方向光/环境光/阴影范围计算)
               ├── modelLoader.js      (网格合并/模型装配/包围盒分析)
               ├── cameraController.js (双相机转场动画/正交视锥计算)
               └── roamingPhysics.js   (第一人称重力/碰撞检测/楼梯步进)
                     │
[组合状态层]   src/components/spatial-model/composables/
               ├── useSpatialModelStage.js       (Three.js舞台/双相机/渲染循环/动态DPR)
               ├── useSpatialModelAssets.js      (GLB并发预加载/节点索引/图层可见性)
               ├── useSpatialModelControls.js    (PointerLock/鼠标转向/键盘漫游/快捷键)
               └── useSpatialModelCalibration.js (机位标定快照/FOV调校/剪贴板复制)
                     │
[UI 装配层]    src/components/spatial-model/
               ├── SpatialModelExplorer.vue      (三维主组件：HUD工具栏与状态编排)
               ├── SpatialModelSpacesDrawer.vue  (全屏模式下的空间清单抽屉)
               ├── SpatialModelLayerDebug.vue    (GLB 图层调试面板)
               └── SpatialModelCalibration.vue   (机位标定与参数面板)
```

---

## 2. 目录与文件清单速查

### (1) 配置与常量 (`src/data/`)
- `spatialModelConfig.js`：
  - `MODEL_BASE_URL` & `MODEL_ASSETS`：GLB 模型文件名与中文名称配置；
  - `IMMERSIVE_VIEW_PRESETS`：各房间漫游的初始机位与视线向量；
  - `DEBUG_LAYER_DEFINITIONS`：3D 调试图层分类；
  - `PLAYER_EYE_HEIGHT`, `PLAYER_RADIUS`, `MAX_STEP_HEIGHT`：物理漫游参数。

### (2) 纯算法工具库 (`src/utils/spatial-model/`)
- `materials.js`：定义建筑写实材质、白模黑边材质、导航热区半透明外观；
- `lighting.js`：配置主光源、补光、地面反光与极地模式照明；
- `modelLoader.js`：静态 Mesh 几何合批（`mergeGeometries`）、阴影配置与包围盒计算；
- `cameraController.js`：正交相机（`OrthographicCamera`）与透视相机（`PerspectiveCamera`）平滑插值转场；
- `roamingPhysics.js`：第一人称射线碰撞系统、楼梯平滑爬升与自由漫游算法。

### (3) 组合式逻辑层 (`src/components/spatial-model/composables/`)
- `useSpatialModelStage.js`：封装 Three.js 核心生命周期、动态 DPR 调度（移动时 1.0，静止时 1.5）、RAF 渲染循环；
- `useSpatialModelAssets.js`：全量并发静默预加载全部 5 个 GLB 资产并缓存；
- `useSpatialModelControls.js`：处理鼠标捕获、拖拽旋转、WASD 碰撞漫游、`F` 键全屏与 `Esc` 四级层级退出；
- `useSpatialModelCalibration.js`：相机参数快照、实时 FOV 调节与 JSON 复制。

### (4) Vue 界面组件 (`src/components/spatial-model/`)
- `SpatialModelExplorer.vue`：主组件，装配 3D 画布与微型 HUD 工具栏；
- `SpatialModelSpacesDrawer.vue`：空间清单抽屉（全屏展开状态下开放）；
- `SpatialModelLayerDebug.vue`：模型图层实时开关调试器；
- `SpatialModelCalibration.vue`：机位参数标定浮层。

---

## 3. 核心交互流转与快捷键

| 操作 / 快捷键 | 作用范围 | 功能说明 |
| :--- | :--- | :--- |
| **`[轴测 / 透视]` 按钮** | 3D 视图内 | 在 **3D 轴测总览** 与 **3D 室内透视漫游** 之间秒级往复流转 |
| **`[❄ 极地模式]` 按钮** | 3D 视图内 | 一键切换极地白模与原始贴图（进入透视时默认白模） |
| **`F` 键 / `[⛶ 全屏]` 按钮** | 全局 | 在中央屏幕嵌入小视窗与全屏放大之间一键切换 |
| **`Esc` 键** | 全局 | **四级阶梯退出**：<br>1. 解锁漫游鼠标 ➔ 2. 关闭抽屉浮层 ➔ 3. 退出全屏 ➔ 4. 退出 3D 回到 2D 空间剖面 |
| **`WASD` / 方向键** | 透视漫游中 | 第一人称行走（带楼梯爬升与墙体碰撞） |
| **`Q` / `E`** | 透视漫游中 | 上升 / 下降 |
| **`C` 键 / `[◎ 标定]` 按钮** | 全屏透视中 | 开启机位标定面板，调校机位与 FOV 并复制参数 |
| **`[✕ 返回剖面]` 按钮** | 3D 视图内 | 退出 3D 视口，返回 2D 空间剖面图 |

---

## 4. 常见二次开发与维护指引

### Q1: 如何替换或更新 3D 模型？
1. 将新的 `.glb` 文件放入 `public/assets/spatial/model/` 目录下；
2. 若文件名发生变化，打开 `src/data/spatialModelConfig.js`，修改 `MODEL_ASSETS` 中对应的 `file` 字段；
3. 浏览器强制刷新（`Cmd + Shift + R` 或勾选 DevTools 的 `Disable cache`）即可生效。

### Q2: 如何微调某个房间漫游的初始视角？
1. 在网页中进入该房间漫游，按 `F` 放大至全屏，按 `C` 打开标定面板；
2. 漫游移动至理想机位，调节 FOV，点击「复制机位参数」；
3. 打开 `src/data/spatialModelConfig.js`，找到 `IMMERSIVE_VIEW_PRESETS` 对应房间 ID，粘贴替换其 `position`, `target`, `fov`。

### Q3: 如何调整极地白模（Arctic Mode）的线框粗细或底色？
- 线框生成与材质配置位于 `src/utils/spatial-model/materials.js` 中的 `createArcticEdges` 与 `createArcticMaterials`。
