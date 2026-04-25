# CS2 Fun Predict

本项目是一个可本地开发、可部署上线的 CS2 电竞预测娱乐网站 MVP，只使用站内虚拟代币，不涉及真钱、提现、实物兑换或现实价值流转。

## 技术栈

- Next.js + React + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- 同项目内后台管理 `/admin`

## 核心说明

- 新用户初始余额 `20` 代币
- 每日登录奖励 `20` 代币，每天仅可领取一次
- 普通用户只能参与预测
- `publisher` 可创建题目并管理自己创建的题目
- `admin` 可管理全部题目和用户
- 题目取消时自动退款
- 题目结算时按 `stake * odds` 发放虚拟代币收益
- 页面底部固定提示虚拟积分免责声明

## 运行

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## 上线

部署说明见 [DEPLOY.md](D:\桌面\所有的想法项目\cs2-fun-predict\DEPLOY.md)

## 默认种子账号

- 管理员
  - email: `admin@example.com`
  - password: `admin123456`
- 发布者
  - email: `publisher@example.com`
  - password: `publisher123`
