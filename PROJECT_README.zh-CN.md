# 百度网盘业务管理前端

这是一个基于 Vue Vben Admin 改造的百度网盘业务管理前端，面向配套 `baidui-download-backend` 后端提供运营后台和用户侧页面。

项目保留了 Vben Admin 的 Monorepo 结构，在 `apps/web-antd` 中实现业务页面、API 模块、路由和状态管理。

## 功能概览

- 管理员登录、动态菜单、权限路由和用户设置。
- 企业网盘账号、成员、登录二维码、空间状态和文件策略管理。
- 个人网盘扫码登录、短信登录及账号信息展示。
- 文件转换、卡密兑换、配额查询和空间清理。
- SVIP 卡、续费卡、卡密生成、批量管理和活动支付。
- 黑名单规则、运营统计、订单/支付记录和租户配置。
- 代理配置、接口说明和基础仪表盘。

## 技术栈

- Vue 3、TypeScript、Vite
- Ant Design Vue、Pinia、Vue Router
- Vben Admin 5.5.x Monorepo
- pnpm、Turbo、Vitest、Vue Test Utils

## 目录说明

```text
apps/web-antd/
├── src/api/       # 后端请求封装
├── src/router/    # 路由和权限配置
├── src/store/     # Pinia 状态
├── src/views/     # 管理端和用户侧页面
└── .env.*         # 环境配置
packages/          # Vben Admin 共享组件与基础包
```

## 后端接口分区

前端默认以 `VITE_GLOB_API_URL` 作为 API 根地址，业务请求路径与后端保持 `/api` 前缀约定：

| 前端模块 | 主要接口前缀 |
| --- | --- |
| 登录与用户 | `/auth`、`/user` |
| 企业网盘 | `/enterprise` |
| 文件转换 | `/convert` |
| 卡密与续费 | `/card`、`/cardRenewal` |
| SVIP 卡 | `/svipCard`、`/admin/svipCard` |
| 风控与统计 | `/black`、`/stats` |
| 支付与订单 | `/pay`、`/order` |

对应后端项目：`baidui-download-backend`。

## 本地开发

环境要求：Node.js 20.10+、pnpm 9.12+。

```bash
corepack enable
pnpm install
pnpm --filter @vben/web-antd dev
```

开发环境接口地址配置在 `apps/web-antd/.env.development`：

```dotenv
VITE_GLOB_API_URL=http://localhost:8080/api
```

生产构建：

```bash
pnpm --filter @vben/web-antd build
```

发布前请将 `.env.production` 中的接口地址替换为自己的部署地址，不要提交真实内网地址、访问令牌或密钥。

## 开源注意事项

1. `VITE_*` 变量会被打包进浏览器资源，不能存放后端私钥、支付密钥或长期 Token。
2. `VITE_APP_STORE_SECURE_KEY` 只能作为前端数据混淆用途，不能被当作安全边界。
3. `personalLogin` 中涉及第三方网盘登录流程的页面和请求，应仅用于获得明确授权的账号和数据。
4. 前后端接口、错误码、登录过期策略和 CORS 配置必须在发布前联调确认。
5. 删除生产环境地址、测试账号、二维码登录数据、构建产物和调试日志。
6. 项目基于 Vben Admin 改造，发布时需保留其 MIT 许可证，并核对新增代码、图片和第三方依赖的授权关系。

## 合规边界

本项目不应被用于绕过会员、下载速度、配额、验证码、风控或访问控制，也不应处理未获授权的第三方账户数据。使用者需遵守适用法律、隐私要求及相关平台服务条款。

## 许可证

基础模板采用 MIT 许可证，详见仓库 `LICENSE`。业务改造部分的许可证和第三方资源授权请由项目维护者在公开发布前确认。
