<p align="center">
  <img src="./public/icon-readme.png" width="96" alt="小满 App 图标" />
</p>

<h1 align="center">小满</h1>

<p align="center">
  <strong>一个话不多，但会认真听、慢慢记住你的 AI 朋友。</strong>
</p>

<p align="center">在见面之前，先让我认得你。</p>

<p align="center">
  <a href="https://xiaoman-lime.vercel.app"><strong>在线体验</strong></a>
</p>

<p align="center">
  <img src="./public/images/readme/xiaoman-mockup-reading.webp" width="880" alt="小满今日解读与瓶中星光主视觉" />
</p>

## 关于小满

小满是一款以日常记录为入口的 AI 陪伴应用。

你可以随时写下一句话，或者直接说一段话。小满会认真听，用简短、有人情味的方式回应；当记录逐渐积累，它也会从真实内容中整理情绪变化、生活主题和近期状态，帮助你回看过去，也更了解此刻的自己。

小满不追求频繁打扰，也不会急着替你下结论。它更像一个安静的长期陪伴者：记住你说过的话，在合适的时候轻轻回应。

## 产品能力

- **多种方式记录**：支持文字输入与浏览器语音实时转写；图片附件目前作为实验能力提供。
- **温柔的 AI 回应**：根据刚刚写下的内容给出简短回应；遇到具体困扰时，提供一个可以开始的小行动。
- **今日解读**：结合真实记录生成今日笔记、启发式情绪趋势和贴近当下的内置文学摘句。
- **长期回看**：整理历史记录、生活主题、情绪曲线和小满观察到的变化。
- **小满的预感**：根据近期记录形成关于情绪、行为或睡眠的轻量预感，并在几天后邀请用户反馈是否应验。
- **陪你做决定**：输入两个选项获得一段辅助推演，也可以交给一枚硬币轻松决定。
- **娱乐性彩票号码“预测”**：根据生日、账号和当周确定性生成双色球、超级大乐透及排列三幸运号，每周一刷新。
- **生成分享海报**：将今日解读制作成带二维码的图片，通过系统分享或下载保存。
- **账号与记忆同步**：支持短信验证码登录，用户资料、记录和反馈通过 Supabase 持久化保存。
- **移动端优先**：适配手机浏览器，并支持添加到主屏幕；当前不提供离线访问。

> 本功能仅生成娱乐性的每周幸运号码。号码由生日、用户标识和 ISO 周数经过确定性伪随机算法生成，不使用历史开奖数据，不构成彩票预测或投注建议，也不能提高中奖概率。请理性参与。

## 在线体验

正式地址：[https://xiaoman-lime.vercel.app](https://xiaoman-lime.vercel.app)

界面以手机端为主要使用场景；在桌面浏览器中会保持最大 `480px` 的移动端布局。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 全栈框架 | Next.js 14 App Router、React 18、TypeScript |
| 界面与动效 | Tailwind CSS、Framer Motion、Lucide React |
| 客户端状态 | Zustand |
| 数据与认证 | Supabase Postgres、HMAC Session、短信验证码 |
| AI 能力 | OpenAI 兼容接口，本地启发式逻辑兜底 |
| 部署与终端 | Vercel、Web App Manifest |

## 本地启动

建议使用 Node.js 20 LTS 和仓库内的 `package-lock.json`：

```bash
git clone https://github.com/jinbowen1990221-lgtm/xiaoman.git
cd xiaoman

npm ci
cp .env.example .env.local
npm run dev
```

本地开发服务器默认运行在 [http://localhost:3000](http://localhost:3000)。

未配置 Supabase 和短信服务时，本地开发会使用进程内存存储，并可使用 `.env.example` 中的开发验证码。开发服务器重启后，内存数据会消失；生产环境不会启用这些开发兜底。

## 环境变量

将 `.env.example` 复制为 `.env.local`，再按需要填写：

| 变量 | 生产环境 | 用途 |
| --- | --- | --- |
| `SESSION_SECRET` | 强烈建议 | HMAC 会话签名密钥，建议至少 32 字节 |
| `DEV_OTP` | 仅限本地 | 仅供本地开发的固定验证码，生产环境不会接受 |
| `SMS_PROVIDER` | 必填 | 当前短信服务商填写 `aliyun` |
| `SMS_ACCESS_KEY_ID` | 必填 | 阿里云短信 AccessKey ID |
| `SMS_ACCESS_KEY_SECRET` | 必填 | 阿里云短信 AccessKey Secret |
| `SMS_SIGN_NAME` | 必填 | 阿里云短信签名名称 |
| `SMS_TEMPLATE_CODE` | 必填 | 阿里云短信模板代码 |
| `SUPABASE_URL` | 必填 | Supabase 项目地址 |
| `SUPABASE_SERVICE_ROLE_KEY` | 必填 | 仅供服务端访问数据库的密钥 |
| `SUPABASE_ANON_KEY` | 可选 | 当前代码未读取，保留给未来浏览器端能力 |
| `AI_API_KEY` | 可选 | OpenAI 兼容接口密钥；不填时使用本地兜底 |
| `AI_BASE_URL` | 可选 | API 根地址，默认使用 OpenAI 地址 |
| `AI_MODEL` | 可选 | 模型名称，默认 `gpt-4o-mini` |

不要将真实密钥写入源码，也不要使用 `NEXT_PUBLIC_` 前缀暴露 `SUPABASE_SERVICE_ROLE_KEY`、短信密钥或 `SESSION_SECRET`。

## 初始化 Supabase

在 Supabase SQL Editor 中执行完整的 [`db/schema.sql`](./db/schema.sql)。该文件会一次性创建：

- 用户、日常记录、今日预感、抛硬币、生活预感和验证码数据表；
- `verify_otp_code(...)` 原子验证码校验函数；
- 必要的索引、RLS 和 `service_role` 权限。

用户内容只由 Next.js 服务端通过 `service_role` 访问。`db/users.sql` 是早期遗留结构，不应再用于新建或恢复数据库。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run typecheck` | 执行 TypeScript 类型检查 |
| `npm run check:assets` | 校验 PNG/WebP 是否为有效二进制素材 |
| `npm run build` | 运行素材校验并创建生产构建 |
| `npm run start` | 启动已经构建完成的生产服务 |

推荐在提交前运行：

```bash
npm run typecheck
npm run check:assets
npm run build
```

## 项目结构

```text
app/                 页面、布局和 Route Handlers
  api/               登录、用户、记录、预感、决策与 AI 接口
  login/             手机验证码登录
  onboarding/        新用户引导
  record/            日常记录
  history/           历史回看
  me/                个人资料
components/          React UI 与交互组件
lib/                 认证、短信、Supabase、AI 与领域逻辑
db/schema.sql        当前完整的 Supabase 数据库结构
hooks/               React Hooks
store/               Zustand 客户端状态
public/              图片、应用图标和 manifest
scripts/             构建与素材校验脚本
middleware.ts        登录态与 onboarding 路由守卫
```

## 部署

项目已连接 Vercel。向 `main` 分支推送提交会触发生产部署；部署前需要在 Vercel 的 Production 环境中配置上述生产环境变量。

生产地址：[https://xiaoman-lime.vercel.app](https://xiaoman-lime.vercel.app)

## 使用说明

小满生成的回应、情绪分析、生活预感与彩票号码都基于用户输入、可选模型和程序规则，仅用于记录、陪伴与娱乐，不构成医疗、心理、投资或购彩建议。其中趋势百分比与预感“把握”均未经过专业概率校准。
