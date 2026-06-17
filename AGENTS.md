# AI 编码宪法 (AI Code Constitution)

> **目标**：构建世界级 Merchant Admin OS。
> **风格参照**：Shopify, Stripe, Linear, Notion, Vercel, Apple.

---

## 核心法条 (The Enshrined Rules)

### ① 极简至上 (Maximal Elegance, Minimal Code)
* **禁止废话**、禁止冗余、禁止写无任何实际业务逻辑的“脚手架测试代码”或不切实际的“技术展示”。
* **代码必须短**、结构必须干净。优先保证代码可读性与品牌感设计。
* **删除优先 (Delete-First)**：能删除的代码，绝不优化；能合并的组件，绝不复制；能抽象的逻辑，绝不重复；能减少的缩减层级，绝不叠加；能用一个词解释，绝不写成一整句话。高级感全部来自于克制。

### ② 极智命名 (Micro Namespaces)
* 任何业务逻辑实体、结构体名称**必须不超过 5 个汉字 / 英文字符组合**。
* **禁止出现** `CustomerManagementComponent` 或 `ProductInformationContainer` 之类的臃肿工程化堆砌。
* **统一采用最自然、简洁、明确的名词**：
  * `Order`, `Product`, `User`, `Panel`, `Grid`, `Form`, `Card`, `Tabs`, `Sheet`, `Badge`, `Stat`, `Menu`, `Help`, `Chat`, `Event`.

### ③ 精密模块自治 (Cellular Module Isolation)
* 严禁将所有逻辑和 UI 拼凑进一个单体文件（如庞大的 `App.tsx` 或万能 `ContextPanel.tsx`）。
* 一个文件有且仅解决一个逻辑层次的问题。
* 单文件行数**超过 300 行必须拆分**，包含函数**超过 10 个必须拆分**。
* 严禁出现 switch 递归巨兽与 if 多层地狱嵌套。
* 商品、订单、客群、折扣配置等核心服务均设立自治业务子目录（`modules/*`）。严禁跨模块强硬横向耦合依赖，所有的通信统统路由给中枢消息。

### ④ 统一动态组件层 (Schema-Driven Platform UI)
* 秉承组合模式，严禁针对不同对象重复复制几乎相同的 Table、Filter 或 Form 定义。
* 系统所有数据表格、校验模型统统通过最底层的 **Zod 联合定义**（位于 `schemas/*`）。
* 无论是在 `modules` 生成新增记录、在 `ContextPanel` 编辑某行价格，还是在 `DataGrid` 渲染各端字段，其列数据、输入字段配置与交互逻辑均通过解析 `schema` 元数据动态生成，实现真正的 **Schema Driven UI**。

### ⑤ 级联式生命周期隔离 (State to Persistence Chain)
* 严禁 UI 层越级直接拦截底层底层数据库或直连原始请求。
* 系统通信与持久化控制链必须完全向下单向流动：
  ```
  UI Component (Modules / Context Panels)
       ↓
  Store State Management (Zustand Stores)
       ↓
  Service Proxy Layer (*.service.ts)
       ↓
  API Client (Fetch/XHR) / Native Backend / LocalStorage
  ```

### ⑥ 响应式多栏面板架构 (Responsive Adaptive Columns Grid)
* 遵守原生 Mobile First 准则，实现 Phone, Tablet, Desktop 的无损动态适配。
* 支持多维交互形式，高精仿照 Shopify 经典第 3 栏：
  * **1-Column** (精简列表格面板/表格视图)
  * **2-Column** (侧边控制抽屉/全局弹出层)
  * **3-Column** (多功能实体 Context Dynamic Panel —— `Order`, `Product`, `Customer`, `Discount`, `Help`, `Sidekick`)，支持独立最大化/最小化无级变形。

### ⑦ 异步事件总线治理 (Asynchronous Events Core)
* 极力避免核心业务模块之间出现强硬的业务引入（Import）。
* 所有高关联的交叉动作统统解耦：
  * 订单创建后，将由 `order.events.ts` 发射 `order.created` 到事件总线，通知库存扣减和系统消息通知中心对齐，严禁在订单控制器内部直写涉及产品库存的写入行为。

### ⑧ 视觉高级感 (Masterclass Aesthetics)
* 始终保持优雅、克制的高对比度光影布局。
* **禁止任何花哨和多余的点缀**：拒绝各种彩虹渐变、拒绝突兀的大色块边框、拒绝多重无意义图标、拒绝拟物化厚重阴影。
* 全景采用高级留白，配合柔和的 1 像素精致细线，将质感完全承托在卓越的字体（Typography）、间隙节奏（Spacing）以及如德系豪车按键般轻快干练的微交互动画上。

---

> **“高级源自极致的纯净与绝对的自制。”** ── 此宪法构成此软件库开发的最高准则。
