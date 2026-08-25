# 百度网盘业务管理前端

这是百度网盘业务管理系统的前端项目，配套后端项目为 `baidui-download-backend`。项目面向运营人员和普通用户提供统一的管理后台、卡密/会员业务页面、企业网盘管理及个人网盘操作界面。

## 功能介绍

- 管理员登录、动态菜单、权限路由和用户设置
- 企业网盘账号、成员、登录二维码和空间策略管理
- 个人网盘扫码登录、短信登录及账号信息展示
- 文件转换、配额查询和空间清理
- SVIP 卡、续费卡、卡密生成、兑换和批量管理
- 黑名单规则、运营统计、订单/支付记录和租户配置
- 用户中心、代理配置和接口说明页面

## 使用的框架

本项目基于以下技术构建：

- Vue 3
- TypeScript
- Vite
- Ant Design Vue
- Pinia
- Vue Router
- Vben Admin Monorepo
- pnpm、Turbo、Vitest

框架地址：

- Vben Admin：[https://github.com/vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- Vben Admin 文档：[https://doc.vben.pro/](https://doc.vben.pro/)

本项目是在 Vben Admin 基础上的业务改造版本，业务页面、接口封装、路由、状态和配置属于本项目内容。

## 项目结构

```text
apps/web-antd/
├── src/api/       # 后端接口请求封装
├── src/router/    # 路由和权限配置
├── src/store/     # Pinia 状态管理
├── src/views/     # 管理端和用户侧页面
└── .env.*         # 开发和生产环境配置
packages/          # 前端基础组件及共享模块
```

## 后端接口约定

前端通过 `VITE_GLOB_API_URL` 配置后端 API 根地址，默认接口前缀为 `/api`。

| 功能模块 | 接口前缀 |
| --- | --- |
| 登录与用户 | `/auth`、`/user` |
| 企业网盘 | `/enterprise` |
| 文件转换 | `/convert` |
| 卡密与续费 | `/card`、`/cardRenewal` |
| SVIP 卡 | `/svipCard`、`/admin/svipCard` |
| 风控与统计 | `/black`、`/stats` |
| 支付与订单 | `/pay`、`/order` |

后端项目地址请以实际部署仓库为准。

## 环境要求

- Node.js 20.10 或更高版本
- pnpm 9.12 或更高版本
- 可访问的后端 API 服务

## 安装与运行

在项目根目录执行：

```bash
corepack enable
pnpm install
pnpm --filter @vben/web-antd dev
```

开发环境配置文件为 `apps/web-antd/.env.development`，例如：

```dotenv
VITE_GLOB_API_URL=http://localhost:8080/api
```

## 构建发布

```bash
pnpm --filter @vben/web-antd build
```

构建产物和部署方式由实际托管环境决定。发布前请确认 `.env.production` 中使用的是正式 API 地址。


## 合规边界

本项目不应被用于绕过会员、下载速度、配额、验证码、风控或访问控制，也不应处理未获授权的第三方账户数据。使用者需遵守适用法律、隐私要求及相关平台服务条款。

## 许可证

基础框架采用 MIT 许可证。业务改造部分的许可证和第三方资源授权请由项目维护者在公开发布前确认。
