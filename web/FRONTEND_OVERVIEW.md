# 前端代码说明

前端有两套主题，都是管理后台 UI。

日常改功能：web/default/
对照旧版：web/classic/

两套目录结构不同，不是简单换肤。

---

## 一、default（主推）

技术：React 19、TypeScript、Rsbuild、TanStack Router、React Query、Zustand、Base UI、Tailwind

入口文件：web/default/src/main.tsx
作用：启动应用，挂载路由、React Query、主题、i18n、全局错误处理

路径别名 @ 指向 web/default/src/

---

### 1. 整体目录干什么

web/default/src/routes/
作用：定义网址对应哪个页面。文件路径大致等于 URL。路由文件通常很薄，真正页面在 features 里。

web/default/src/features/
作用：业务功能代码。改某个后台功能，优先来这里。

web/default/src/components/ui/
作用：通用基础组件，如按钮、输入框、弹窗、表格基础件。

web/default/src/components/layout/
作用：后台整体布局，侧栏、顶栏、页面框架。

web/default/src/components/data-table/
作用：通用数据表格能力，列表页会复用。

web/default/src/components/
作用：跨功能共用组件，如语言切换、确认弹窗、复制按钮、主题切换、通知、Turnstile 验证码等。

web/default/src/stores/
作用：全局状态（Zustand），登录用户、通知、系统配置等。

web/default/src/lib/api.ts
作用：统一 axios 请求封装，带 cookie、鉴权、错误处理。业务接口多数走它。

web/default/src/lib/
作用：工具函数，如角色权限、OAuth、Passkey、时间格式、主题、货币展示等。

web/default/src/hooks/
作用：全局 hooks，如侧栏、系统状态、移动端判断、防抖、剪贴板等。

web/default/src/i18n/
作用：多语言。locales 里是各语言文案 JSON。

web/default/src/context/
作用：主题、字体、文字方向等 Provider。

web/default/src/styles/
作用：全局样式和主题相关样式。

web/default/src/assets/
作用：logo、图标等静态资源。

web/default/src/config/
作用：前端配置，如字体配置。

web/default/src/routeTree.gen.ts
作用：TanStack Router 自动生成的路由树，不要手改。

---

### 2. 路由 routes 各目录干什么

路由文件一般只做：定义路径、校验 URL 参数、挂上 features 里的页面组件。

公开页：
web/default/src/routes/index.tsx          首页
web/default/src/routes/about/             关于页
web/default/src/routes/pricing/           定价 / 模型广场
web/default/src/routes/docs/              文档页
web/default/src/routes/welcome/           欢迎页

登录注册：
web/default/src/routes/(auth)/            登录、注册、OTP、找回密码、OAuth 等

控制台（需登录）：
web/default/src/routes/_authenticated/dashboard/          仪表盘
web/default/src/routes/_authenticated/keys/               API 密钥管理
web/default/src/routes/_authenticated/channels/           渠道管理
web/default/src/routes/_authenticated/models/             模型相关
web/default/src/routes/_authenticated/users/              用户管理
web/default/src/routes/_authenticated/wallet/             钱包 / 充值
web/default/src/routes/_authenticated/usage-logs/         用量日志
web/default/src/routes/_authenticated/profile/            个人资料
web/default/src/routes/_authenticated/playground/         接口调试 Playground
web/default/src/routes/_authenticated/chat/               聊天相关
web/default/src/routes/_authenticated/subscriptions/      订阅
web/default/src/routes/_authenticated/redemption-codes/   兑换码
web/default/src/routes/_authenticated/billing/            计费相关
web/default/src/routes/_authenticated/system-settings/    系统设置
web/default/src/routes/_authenticated/system-info/        系统信息

其他：
web/default/src/routes/setup/                 首次安装向导
web/default/src/routes/(errors)/              错误页
web/default/src/routes/privacy-policy.tsx     隐私协议
web/default/src/routes/user-agreement.tsx     用户协议

系统设置细分：
web/default/src/routes/_authenticated/system-settings/site/         站点设置
web/default/src/routes/_authenticated/system-settings/auth/         登录认证设置
web/default/src/routes/_authenticated/system-settings/billing/      计费设置
web/default/src/routes/_authenticated/system-settings/models/       模型设置
web/default/src/routes/_authenticated/system-settings/security/     安全设置
web/default/src/routes/_authenticated/system-settings/operations/   运营设置
web/default/src/routes/_authenticated/system-settings/content/      内容设置

---

### 3. 业务模块 features 各目录干什么

改业务优先看这里。路由只负责挂页面，真正 UI、接口、表格、弹窗都在 feature 里。

每个功能目录常见文件：
web/default/src/features/某功能/index.tsx       功能入口页面
web/default/src/features/某功能/api.ts          这个功能的接口请求
web/default/src/features/某功能/types.ts        类型定义
web/default/src/features/某功能/constants.ts    常量、状态枚举、文案 key
web/default/src/features/某功能/components/     这个功能专用的组件（表格、弹窗、表单等）
web/default/src/features/某功能/hooks/          这个功能专用的 hooks
web/default/src/features/某功能/lib/            表单 schema、小工具等

各功能目录：
web/default/src/features/about/                 关于页内容
web/default/src/features/auth/                  登录注册、Passkey、二次验证等
web/default/src/features/channels/              上游渠道管理（增删改查、测试等）
web/default/src/features/chat/                  聊天功能
web/default/src/features/dashboard/             仪表盘图表、用量概览
web/default/src/features/docs/                  文档页内容
web/default/src/features/errors/                错误展示相关
web/default/src/features/home/                  首页内容
web/default/src/features/keys/                  API 密钥管理
web/default/src/features/legal/                 协议相关内容
web/default/src/features/models/                模型列表 / 模型管理
web/default/src/features/performance-metrics/   性能指标
web/default/src/features/playground/            Playground 调试对话、请求响应
web/default/src/features/pricing/               定价页 / 模型广场
web/default/src/features/profile/               个人资料、账号设置
web/default/src/features/rankings/              排行相关
web/default/src/features/redemption-codes/      兑换码管理
web/default/src/features/setup/                 首次安装向导流程
web/default/src/features/subscriptions/         订阅套餐
web/default/src/features/system-info/           系统运行信息
web/default/src/features/system-settings/       系统设置各分区的实际 UI
web/default/src/features/usage-logs/            用量 / 请求日志
web/default/src/features/users/                 用户管理
web/default/src/features/wallet/                钱包、充值、余额
web/default/src/features/welcome/               欢迎引导

举例：改「密钥管理」
先开 web/default/src/features/keys/
再看 web/default/src/routes/_authenticated/keys/

---

### 4. 状态 stores 干什么

web/default/src/stores/auth-store.ts
作用：当前登录用户信息、登录态、权限相关状态

web/default/src/stores/notification-store.ts
作用：通知列表、未读等通知状态

web/default/src/stores/system-config-store.ts
作用：系统配置缓存，给前端展示用

---

### 5. 多语言 i18n 干什么

web/default/src/i18n/config.ts
作用：i18n 初始化配置

web/default/src/i18n/languages.ts
作用：支持哪些语言

web/default/src/i18n/locales/en.json
web/default/src/i18n/locales/zh.json
web/default/src/i18n/locales/fr.json
web/default/src/i18n/locales/ru.json
web/default/src/i18n/locales/ja.json
web/default/src/i18n/locales/vi.json
作用：各语言文案。key 一般是英文字符串，组件里用 t('英文原文') 取翻译

---

## 二、classic（经典旧版）

技术：React、Rsbuild、Semi Design、react-router-dom、axios、i18next

入口：web/classic/src/index.jsx
作用：启动应用

路由表：web/classic/src/App.jsx
作用：集中写所有路由，哪个路径打开哪个页面，以及登录鉴权包裹

---

### 1. 整体目录干什么

web/classic/src/pages/
作用：页面入口。一个业务一个文件夹，负责拼页面。

web/classic/src/components/
作用：可复用组件。布局、表格、登录表单、设置页、充值卡片、Playground 等都在这。

web/classic/src/components/layout/
作用：侧栏、顶栏、页脚、整体页面框架。

web/classic/src/components/table/
作用：各业务的表格列表（渠道、Token、用户、日志等）。

web/classic/src/components/auth/
作用：登录、注册、重置密码、OAuth 回调等表单。

web/classic/src/components/settings/
作用：设置相关 UI，如个人设置。

web/classic/src/components/topup/
作用：充值、订阅购买、邀请等相关卡片和弹窗。

web/classic/src/components/playground/
作用：Playground 调试界面相关组件。

web/classic/src/components/dashboard/
作用：仪表盘相关组件。

web/classic/src/components/setup/
作用：首次安装相关组件。

web/classic/src/components/common/
作用：通用小组件，如 Loading。

web/classic/src/components/model-deployments/
作用：模型部署相关组件。

web/classic/src/hooks/
作用：按业务分包的数据 hooks，负责拉列表、筛选项、分页、提交等。

web/classic/src/helpers/api.js
作用：统一 axios 实例和通用 API 调用。

web/classic/src/helpers/
作用：鉴权路由、配额展示、Token 工具、日志格式化、Passkey、工具函数等。

web/classic/src/services/
作用：独立服务逻辑，如安全验证 secureVerification。

web/classic/src/i18n/locales/
作用：经典主题多语言文案。

web/classic/src/constants/
作用：常量。

web/classic/src/context/ 和 web/classic/src/contexts/
作用：全局 Context，如站点状态 StatusContext。

---

### 2. 页面 pages 各目录干什么

web/classic/src/pages/Home/               首页
web/classic/src/pages/Dashboard/          仪表盘
web/classic/src/pages/Channel/            渠道管理
web/classic/src/pages/Token/              API Token / 密钥
web/classic/src/pages/User/               用户管理
web/classic/src/pages/Log/                用量日志
web/classic/src/pages/TopUp/              充值
web/classic/src/pages/Setting/            系统 / 站点设置
web/classic/src/pages/Model/              模型管理
web/classic/src/pages/ModelDeployment/    模型部署
web/classic/src/pages/Playground/         接口调试
web/classic/src/pages/Chat/               聊天
web/classic/src/pages/Chat2Link/          Chat2Link
web/classic/src/pages/Pricing/            定价 / 模型广场
web/classic/src/pages/Redemption/         兑换码
web/classic/src/pages/Subscription/       订阅
web/classic/src/pages/Midjourney/         Midjourney 任务
web/classic/src/pages/Task/               异步任务
web/classic/src/pages/Setup/              首次安装
web/classic/src/pages/About/              关于
web/classic/src/pages/UserAgreement/      用户协议
web/classic/src/pages/PrivacyPolicy/      隐私协议
web/classic/src/pages/NotFound/           404
web/classic/src/pages/Forbidden/          403 无权限

---

### 3. 表格 table 各目录干什么

这些通常是列表页的核心实现，配套 hooks 一起用。

web/classic/src/components/table/channels/            渠道表格
web/classic/src/components/table/tokens/              Token 表格
web/classic/src/components/table/users/               用户表格
web/classic/src/components/table/usage-logs/          用量日志表格
web/classic/src/components/table/models/              模型表格
web/classic/src/components/table/redemptions/         兑换码表格
web/classic/src/components/table/subscriptions/       订阅表格
web/classic/src/components/table/mj-logs/             MJ 日志表格
web/classic/src/components/table/task-logs/           任务日志表格
web/classic/src/components/table/model-deployments/   模型部署表格
web/classic/src/components/table/model-pricing/       模型定价表格

---

### 4. hooks 各目录干什么

web/classic/src/hooks/channels/            渠道列表数据与操作
web/classic/src/hooks/tokens/              Token 列表数据与操作
web/classic/src/hooks/users/               用户列表数据与操作
web/classic/src/hooks/dashboard/           仪表盘数据与图表
web/classic/src/hooks/usage-logs/          用量日志查询
web/classic/src/hooks/playground/          Playground 请求、消息编辑等
web/classic/src/hooks/models/              模型相关数据
web/classic/src/hooks/model-pricing/       模型定价数据
web/classic/src/hooks/model-deployments/   模型部署数据
web/classic/src/hooks/redemptions/         兑换码数据
web/classic/src/hooks/subscriptions/       订阅数据
web/classic/src/hooks/mj-logs/             MJ 日志数据
web/classic/src/hooks/task-logs/           任务日志数据
web/classic/src/hooks/chat/                聊天相关
web/classic/src/hooks/common/              通用 hooks，如侧栏、权限、二次验证

---

### 5. helpers 主要文件干什么

web/classic/src/helpers/api.js
作用：axios 实例、通用接口、错误处理

web/classic/src/helpers/auth.jsx
作用：登录鉴权相关，如 PrivateRoute、AdminRoute

web/classic/src/helpers/token.js
作用：Token / 密钥相关接口辅助

web/classic/src/helpers/quota.js
作用：配额展示换算

web/classic/src/helpers/log.js
作用：日志相关辅助

web/classic/src/helpers/passkey.js
作用：Passkey 相关

web/classic/src/helpers/secureApiCall.js
作用：安全二次验证后的接口调用

web/classic/src/helpers/utils.jsx
作用：通用工具，提示、本地存储用户 id 等

web/classic/src/helpers/render.jsx
作用：渲染辅助

web/classic/src/helpers/dashboard.jsx
作用：仪表盘辅助

web/classic/src/helpers/data.js
作用：数据处理辅助

web/classic/src/helpers/history.js
作用：路由 history

web/classic/src/helpers/boolean.js
作用：布尔值处理

web/classic/src/helpers/base64.js
作用：Base64 编解码

web/classic/src/helpers/statusCodeRules.js
作用：HTTP 状态码规则

web/classic/src/helpers/subscriptionFormat.js
作用：订阅数据格式化

---

## 三、改什么去哪找

改业务页面和表格：
default：web/default/src/features/某功能/
classic：web/classic/src/pages/某页面/ 和 web/classic/src/components/table/某业务/

改网址对应哪个页面：
default：web/default/src/routes/
classic：web/classic/src/App.jsx

改基础按钮弹窗输入框：
default：web/default/src/components/ui/
classic：多用 Semi Design 组件，公共件在 web/classic/src/components/common/

改侧栏顶栏布局：
default：web/default/src/components/layout/
classic：web/classic/src/components/layout/

改请求封装：
default：web/default/src/lib/api.ts 和 features 里的 api.ts
classic：web/classic/src/helpers/api.js 和 hooks

改登录注册：
default：web/default/src/features/auth/ 和 web/default/src/routes/(auth)/
classic：web/classic/src/components/auth/

改文案翻译：
default：web/default/src/i18n/locales/
classic：web/classic/src/i18n/locales/

改全局登录态：
default：web/default/src/stores/auth-store.ts
classic：多在 helpers / context / localStorage 相关逻辑里

---

## 四、两套主题怎么对应（方便对照）

default keys          约等于 classic Token
default channels      约等于 classic Channel
default users         约等于 classic User
default usage-logs    约等于 classic Log
default wallet        约等于 classic TopUp
default system-settings 约等于 classic Setting
default redemption-codes 约等于 classic Redemption
default subscriptions 约等于 classic Subscription
default playground    约等于 classic Playground
default dashboard     约等于 classic Dashboard
