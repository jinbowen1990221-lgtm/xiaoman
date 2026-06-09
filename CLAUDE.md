# CLAUDE.md · 小满 / bob-next

**战线**：主业 AI 产品之一（靳博文三条战线，详见全局记忆 [[three-fronts]]）。
**小满**（代号 Bob / Observer）：一个**克制的 AI 陪伴/记录 App** —— 会观察、会记得、用很短的人话回应。手机端优先。
> ⚠️ 此项目在 `~/Documents/Codex/2026-04-20-bob.../bob-next`，**不在 xiaoman 仓库内**，有自己的 git。

## 技术栈
- **Next.js 14 App Router** + TypeScript + **Tailwind 3**。
- 状态：**Zustand**（`store/bob-store.ts`、`onboarding-store.ts`）。动效：Framer Motion。图标：lucide-react。
- 数据：**Supabase**（`@supabase/supabase-js`）。

## 运行
```bash
npm run dev        # localhost:3000
npm run typecheck  # tsc --noEmit（改完务必过一遍）
npm run lint
npm run build
```

## 结构
- `app/` —— 路由。主 Tab：**今日 `/`(today) · 记录 `/record` · 回看 `/history` · 我 `/me`**；另有 `/coin`(抛硬币)、`/lottery`(周抽签)、`/onboarding/*`(引导)、`/login`(+`/verify`)。
- `app/api/` —— Route Handlers：today-note/-omen/-reading、coin-flip、decision、foresight、lottery、records、notes、reflect、history-ai、user、auth。
- `lib/` —— 领域逻辑：`ai.ts`(大模型)、`bob-prompt.ts`(人设 prompt)、`session.ts`/`otp.ts`/`sms.ts`/`auth.ts`(登录)、`supabase.ts`/`mock-user-db.ts`(数据)、`daily-note.ts`/`omen.ts`/`lottery.ts`/`foresight.ts`/`decision.ts`/`literary.ts`(各功能)。
- `db/` —— `schema.sql` / `users.sql`（Supabase 建表）。
- `components/` —— UI；`middleware.ts` —— 登录态守卫。

## 三处"可插拔降级"（核心设计，改动前先理解）
1. **数据库**：配了 Supabase 用真库；没配自动回退 `lib/mock-user-db.ts`（内存 mock）。
2. **AI**：`AI_API_KEY`/`AI_BASE_URL`/`AI_MODEL` 兼容任意 OpenAI 协议端点（通义/豆包/Kimi…）；不填走本地启发式兜底。
3. **短信**：配了真实 SMS 走真短信；没配用 `DEV_OTP=123456`（开发固定验证码）。

## 重要约定 / 坑
- **手机端容器**：最大宽 480px，桌面也按手机布局。次级页隐藏 Tab bar、顶部返回。
- **登录**：手机验证码 + HMAC 签名 session cookie（`SESSION_SECRET`，生产必须改长随机串）。`middleware.ts` 拦截：未登录→`/login`；未完成 onboarding→引导页。public 仅 `/login`、`/login/verify`。
- `lib/mock-user-db.ts` 的读写函数是 **async**，调用处记得 `await`（历史上漏过 await 的 bug）。
- 环境变量见 `.env.example` → 复制成 `.env.local`。**含密钥，勿提交/外发。**
- 写产品文档/复盘叙事走技能包 `bowen-product-narrative`。
