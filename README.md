# CoinFloat

CoinFloat 是一款基于 Plasmo Framework 打造的 Chrome 扩展，为 Solana 生态提供轻量级行情悬浮窗。它固定在网页右下角，实时显示你关注的代币价格与 24 小时涨跌幅，让你在浏览任意页面时都能掌握市场波动。

## 功能亮点

- 实时行情：对接 Dexscreener API，按设定频率刷新价格与涨跌数据
- 悬浮提示：上涨或下跌时触发绿色/红色闪烁动画，波动一目了然
- 自定义列表：在弹窗中增删代币并记住顺序，支持拖拽排序
- 轻松控制：支持一键隐藏悬浮窗、断线自动重试、拖动定位

## 技术栈

- [Plasmo Framework](https://docs.plasmo.com/)（Manifest V3）
- React 18 + TypeScript
- Tailwind CSS、PostCSS

## 开发环境

前置条件：Node.js 18+ 与 [pnpm](https://pnpm.io/)。

```bash
pnpm install
pnpm dev
```

开发模式下，Plasmo 会在 `build/chrome-mv3-dev` 输出扩展。Chrome 内加载方式：打开扩展管理页面 → 启用开发者模式 → “加载已解压的扩展程序” → 选择该目录。

## 构建与打包

```bash
# 生成生产构建
pnpm build

# 输出 build/chrome-mv3-prod 并生成 zip
pnpm package
```

`pnpm build` 会生成 `build/chrome-mv3-prod`，`pnpm package` 会打包为 `build/chrome-mv3-prod.zip`，可直接用于 Chrome Web Store 上传。

## 目录结构

```
├─ assets/                # 图标与 README 截图
├─ components/            # React 组件（悬浮窗、表格等）
├─ lib/                   # Dexscreener API、存储、类型定义
├─ background.ts          # 后台脚本，定时刷新行情
├─ content.tsx            # 内容脚本，负责挂载悬浮窗
├─ popup.tsx              # 扩展弹窗界面
├─ style.css              # 全局样式
└─ ...
```

## 发布提示

- 确认 `pnpm build && pnpm package` 生成的 zip 文件大小正常
- 准备至少一张 1280×800 或 640×400 的产品截图，以及商店 Promo Tile
- 在 Chrome Web Store 表单中如实说明单一用途与权限来源（storage、alarms、Dexscreener API）

## 隐私

扩展仅使用 `chrome.storage` 保存本地偏好，不收集个人信息。详细条款请参见 [PRIVACY.md](PRIVACY.md)。

## License

项目遵循「CoinFloat Source Code License」：允许个人或内部学习使用及非商业修改，但禁止未经书面授权的商业用途、再发布或在任何浏览器扩展商店上架。完整条款见 [LICENSE](LICENSE)。

## 反馈

如有问题或建议，欢迎通过 Issue/PR 贡献，或联系作者 [@eatphantom](https://x.com/eatphantom)。
