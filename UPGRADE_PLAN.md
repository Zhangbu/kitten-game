# Kittens Game 技术栈现代化升级方案

## 为什么升级

项目当前技术栈严重老化（~2015 年水平）：
- **Dojo Toolkit** (pre-1.7)：类系统、DOM 操作、事件总线
- **React 0.13.3**：`React.createClass`、手写 `$r = React.createElement`
- **SystemJS**：仅用作顺序脚本加载器
- **jQuery**：与 Dojo 混合使用
- **无构建工具**：仅 http-server 直接运行
- **ES5 only**
- **game.js 160KB + core.js 62KB** 单文件过大
- **无 PWA、无 TypeScript**

## 分阶段方案

```
Phase 0 (Vite 基础设施)
  └─ Phase 1 (ES Module 过渡)
       ├─ Phase 2 (替换 Dojo DOM)
       ├─ Phase 3 (替换事件总线)
       ├─ Phase 4 (替换类系统)     ← 依赖 Phase 2+3
       ├─ Phase 5 (移除 jQuery)    ← 依赖 Phase 2
       └─ Phase 6 (React 升级)     ← 依赖 Phase 3
            └─ Phase 7 (Vitest)    ← 依赖 Phase 4+6
Phase 8 (TypeScript)   ← 可从 Phase 4 后开始
Phase 9 (代码拆分)     ← 依赖 Phase 4
Phase 10 (PWA + 最终清理)
```

---

## Phase 0：构建基础设施（Vite + 包现代化）

**目标**：用 Vite 替代 http-server，游戏行为不变但有 HMR。

**操作**：
1. 创建 `vite.config.js`
2. 更新 `package.json`：http-server → vite，添加 dev/build/preview 脚本
3. 创建 `src/main.js`（空占位）
4. 更新 `.gitignore` 忽略 dist/、.vite/
5. 安装依赖，验证游戏正常加载

---

## Phase 1：ES Module 过渡

**目标**：每个 JS 文件获得 ES module 导出，移除 SystemJS。

**操作**：
1. 创建 `src/lib/es-compat.js` 兼容工具（同时 export + 赋值到全局）
2. 逐一在每个游戏文件末尾添加 export 语句
3. `src/main.js` 按依赖顺序 import 所有游戏文件
4. 从 index.html 移除 SystemJS 加载链
5. 删除 `lib/system.js`、`lib/system-polyfills.js`
6. 设置 `"type": "module"`

---

## Phase 2：替换 Dojo DOM 操作

**目标**：用原生 DOM API 替换所有 `dojo.byId`、`dojo.create` 等。

**操作**：
1. 创建 `src/lib/dom.js`：byId()、create()、empty()、style()、addClass()、removeClass() 等
2. `dojo.connect()` → `addEventListener()`
3. 按文件逐一替换：core.js → game.js → js/ui.js → 各 js/*.js
4. 每替换一个文件就测试

---

## Phase 3：替换事件总线（dojo.publish → mitt）

**目标**：用轻量级 mitt 替换 Dojo 的 pub/sub。

**操作**：
1. `npm install mitt`
2. 创建 `src/lib/event-bus.js`
3. 修改 game.js 的 _publish() 方法
4. 修改 js/ui.js 和各 JSX 文件的 dojo.subscribe()

---

## Phase 4：替换 Dojo 类系统（dojo.declare → ES6 Class）

**目标**：核心改动。将 159 个 `dojo.declare` 转为 ES6 class。

**操作**：
1. 创建 `src/lib/declare.js` 过渡兼容层
2. `this.inherited(arguments)` → `super.method()`
3. 多继承 mixin → 组合模式
4. `dojo.hitch` → `.bind(this)` 或箭头函数
5. 从简单类开始（config.js、js/math.js），逐步到复杂类
6. 完成后删除 lib/dojo.js、lib/dojo.xd.js

---

## Phase 5：移除 jQuery

**目标**：用原生 API + fetch 替代所有 jQuery。

**操作**：
1. `$.ajax()` → `fetch()`
2. `$.getJSON()` → `fetch().then(r => r.json())`
3. `$(el).hide()/.show()` → `el.style.display`
4. 删除 lib/jQuery.js

---

## Phase 6：React 升级（0.13 → 18）

**目标**：React 18 函数组件 + Hooks + 真正 JSX。

**操作**：
1. `npm install react@18 react-dom@18`
2. Vite 配置 JSX 编译
3. `.jsx.js` → `.jsx`
4. `React.createClass` → 函数组件 + Hooks
5. React 18 `createRoot()` API
6. 移除 `mixin.IReactAware` 桥接层

---

## Phase 7：测试框架升级（Jest → Vitest）

**目标**：升级测试框架，添加 React 组件测试。

**操作**：
1. `npm install -D vitest @testing-library/react`
2. 创建 vitest.config.js
3. 迁移现有测试
4. 添加 React 组件测试

---

## Phase 8：TypeScript 接入

**目标**：基础设施文件加类型，支持 .ts/.tsx。

**操作**：
1. typescript + tsconfig.json（allowJs: true 渐进）
2. 转换 src/lib/ 下的工具模块
3. 转换 config.js、js/math.js

---

## Phase 9：代码拆分

**目标**：拆分 game.js（5400 行）和 core.js（2458 行）。

**操作**：
- game.js → src/game/Timer.js、Telemetry.js、Server.js、EffectsManager.js、GamePage.js
- core.js → src/ui/Control.js、TabManager.js、Console.js、Button/*、Panel.js、UIUtils.js

---

## Phase 10：PWA + ESLint 9 + 最终清理

**目标**：离线支持、工具链最终化。

**操作**：
1. manifest.json + service worker
2. ESLint 7 → ESLint 9 flat config
3. 移除 IE9 workaround 代码
4. 更新 CI 配置

---

## 验证方式

- 每阶段结束后 `npm run dev` 启动，检查游戏功能正常
- `npm test` 全部通过
- 旧版存档兼容性验证

## 高优先级

- Phase 4（类系统替换）最高风险，需逐类迁移逐类测试
- 保存格式在所有阶段保持兼容
- 每个 Phase 独立 commit，方便回滚
