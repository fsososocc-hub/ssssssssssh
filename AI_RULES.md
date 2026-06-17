# OMEGA GOD-LAYER AI COMMERCE OS PERMANENT CONSTITUTION
# AI 永久编码宪法 (AI Permanent Constitutional Rules)

> **最高指示**：本文件是系统的最高底层逻辑宪法，任何 AI (包括 Cursor, Claude, ChatGPT, Gemini, Copilot, Trae ) 在任何时候增加、修改、优化系统代码前，**必须首先且完整阅读并严格遵守本法则**。

---

## 核心第一原则：数据优先 (Data First Principle)

任何功能、模块、业务实体的设计和开发，必须严格遵循以下单向演进顺序，绝对禁止在未设计好底层数据结构和通信层前直接编写前端 UI 页面：

```text
Table (数据库表/Mock结构)
    ↓
Schema (Zod 校验联合定义)
    ↓
Service Layer (数据存取/API代理服务)
    ↓
Store State Management (Zustand 状态机)
    ↓
Module Views (自治组件/列表/大排版)
    ↓
UI Panels (Context Panel/展示抽屉)
```

* **禁止行为**：
  * 先写页面 UI，后补状态库或数据库结构。
  * 在 UI Component 内部越级拦截、编写或直接控制数据库、API 直连、本地存储的事务。

---

## 根目录数据库规范 (Root Database Isolation)

系统所有底层存储实体，必须在目录中有着清晰划分，根目录下的数据库/模拟库文件统统放置在：
`src/database/`

系统应确保（或未来扩展）如下结构或表的职责：

```text
database/
  ├── orders.ts         (订单表)
  ├── products.ts       (商品/SKU/变体表)
  ├── customers.ts      (客群/用户表)
  ├── inventory.ts      (库存调节/多仓变动)
  ├── collections.ts    (商品系列/目录分类)
  ├── discounts.ts      (折扣/活动规则)
  ├── markets.ts        (国际市场/多币种)
  ├── payments.ts       (支付通道/模拟流水)
  ├── shipping.ts       (运输模版/服务商)
  ├── taxes.ts          (税率/国家规则)
  ├── locations.ts      (自提店/多仓位置)
  ├── analytics.ts      (每日损益/统计日历)
  ├── notifications.ts  (系统级广播/客诉消息)
  ├── users.ts          (商家子账号)
  ├── roles.ts          (RBAC 角色权限)
  ├── permissions.ts    (系统操作权限映射)
  ├── settings.ts       (店铺主体配置)
  ├── apps.ts           (应用嵌入挂载插件)
  ├── channels.ts       (销售渠道：网店/POS/独立站)
  ├── workflows.ts      (自动化任务工作流)
  ├── files.ts          (文件桶/永久 CND URL 库)
  ├── ai.ts             (AI 专家卡片/Sidekick认知)
```

* **禁止行为**：乱写临时数据，将 Mock 数据或 Schema 定义分散混杂在随意一个 UI 页面逻辑、按钮控制器或公共组件文件中。

---

## 新功能递进规则 (Five-Layer Synchronous Sync)

增加任何新功能时，必须同时在对应的五层结构中建立对应自治。**绝对禁止缺层**：

1. **Table** (`src/database/*`)
2. **Schema** (`src/schemas/*`)
3. **Service** (`src/services/*`)
4. **Store** (`src/stores/*`)
5. **Module** (`src/modules/*`)

### 【一功能一表法则】 (Single Function, Dedicated Table)
* 每一个新业务功能必须拥有独立的、最小命名空间的数据库文件与表实体。
* **例如 Coupon 功能**：
  * **必须命名为**：`database/coupons`，并同步创造 `coupon.schema.ts`、`coupon.service.ts`、`couponStore.ts` 以及位于 `modules/coupons` 的独立文件夹。
  * **禁止行为**：直接在 discounts 表里塞入错综复杂的 coupon 字段进行大杂烩合并。

### 【禁止万能表规范】
* 绝对不准建立任何包含 `settings`, `config`, `system`, `common`, `other`, `data`, `misc` 等语义极广的万能表或万能配置文件，任何配置必须独立化（如 `tax_settings`, `shipping_profiles`）精准收窄。

---

## 模块必须能独立删除 (Cellular Modular Deletability)

为了保证完美的 OS 级插拔与可扩展性，任何独立业务模块（如 customer reviews 等）在删除时，应当只需要操作以下路径的相关自治文件夹：

```text
删除 reviews 功能，有且仅会移除：
  ├── src/database/reviews.ts
  ├── src/schemas/review.schema.ts
  ├── src/services/review.service.ts
  ├── src/stores/reviewStore.ts
  ├── src/modules/reviews/
```

在系统其它地方，应当不存在硬编码强依赖调用（只通过中枢消息或动态 Schema Driven Table/Tabs 组件来解耦）。保证代码完全可插拔，移除它不影响大盘整体运行。

---

## 完美统一 UI 层与高级标准组件 (Schema-Driven OS UI)

严禁针对不用业务场景重复编写逻辑极其相似的 Grid、Form、Detail 面板。

### 基础通用原子 UI：
`Grid`, `Form`, `Card`, `Panel`, `Sheet`, `Tabs`, `Menu`, `List`, `Table`, `Dialog`, `Drawer`, `Search`, `Filter`, `Select`, `Badge`, `Stat`, `Timeline`, `Upload`, `Avatar`, `Toast`, `Empty`, `Skeleton`.

### 标准高级标准组件 (Ready-to-Use Core UX)：
1. **DataGrid**：基于 Zod Schema 驱动的表格，内置搜索、筛选、排序、批量动作、分页，且自动渲染相应类型的 Badge、价格、状态。
2. **FormBuilder**：基于 Zod Schema 驱动的高智能动态表单，带校验与级联交互，能够一秒生成新增或编辑面板。
3. **Command**：全局 Spotlight 搜索命令行，支持 `Cmd+K`。
4. **Kanban & Calendar & Timeline & Media & Chart**：行业级商业大盘标配。

---

## 核心表基本法 (General Table Schemas)

每个业务数据库表默认必须包含以下通用字段：
* `id`: 唯一字符 UUID/主键
* `createdAt`: ISO 8601 字符串
* `updatedAt`: ISO 8601 字符串
* `status`: 状态机 string (`'active' | 'draft' | 'archived'`)

并且未来设计必须预留或支持：
* `softDelete`: 软删除支持
* `sort`: 默认排序列数值
* `tenantId`: 多租户支持
* `shopId`: 多店铺支持

---

## 根目录极简文件结构宪章 (Minimal Master Root Structure)

系统根目录内只允许存在以下高密度命名空间的子目录：

```text
src/
  ├── app/         (应用入口 App.tsx & Page 骨架)
  ├── modules/     (高度自治的各业务服务子目录，如 modules/products, modules/orders)
  ├── layouts/     (响应式 Mobile First 布局套件，包含 AdminLayout, Desktop, Tablet, Mobile)
  ├── context-panel (经典第三栏/动态属性控制边栏)
  ├── components/  (全局通用 UI 原子组件与高级 DataGrid, FormBuilder, SidekickAI)
  ├── schemas/     (底座 Zod 联合元数据定义)
  ├── database/    (静态/本地持久化自治数据库)
  ├── services/    (异步总线 API 服务逻辑)
  ├── stores/      (干净的 Zustand 跨层生命周状态机)
  ├── events/      (事件总线与异步通知，如 order.events.ts)
  ├── hooks/       (精细化公共勾子)
  ├── utils/       (轻量级底层无状态辅助函数，不引入任何业务场景，严禁放业务代码)
```

任何除此结构以外的目录结构都是严格禁止的。

---

## AI 决策自我提问 (The Supreme Six AI Questions)

任何 AI 代理在增加、拓展、优化或修改代码时，**必须当即完成如下 6 问首发对齐**：
1. **有没有表？** (是否已设计 `src/database/*` 相关的精简数据或字段？)
2. **有没有 schema？** (是否已包含对应的 Zod schema 用于数据流转校验？)
3. **有没有 service？** (是否包含存取方法或 API 通信服务接口？)
4. **有没有 store？** (是否已在 Zustand state store 注册？)
5. **有没有 module？** (是否已放入对应的 `src/modules/*` 高抗震自治开发区间？)
6. **有没有 panel？** (是否可以通过第3栏 Context Panel 渲染其属性？)

有则按部就班修改，无则立即在对应的对应文件夹下依次递进式新建，**绝对不能直接将逻辑强塞或乱放到主页面！**

---

> **“高级源自极致的纯净与绝对的自制。”** 本法典为最高系统底线规范。
