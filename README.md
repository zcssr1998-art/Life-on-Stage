# Life on Stage / 人生随机实验室

当前主线：**V7 · Engine Rewrite**。

V7 将旧版逐层 hotfix 的运行时彻底拆开：单一 GameState、TypeScript strict、独立财富/职业/关系/世界/命运/死亡系统、数据驱动事件、按年龄懒加载事件包、IndexedDB 存档，以及部署前自动人生模拟。

- 在线版：`https://zcssr1998-art.github.io/Life-on-Stage/`
- 自动模拟仪表盘：`/v7/diagnostics.html`
- 架构说明：`v7/ARCHITECTURE.md`

## 本地构建

```bash
npm install
npm run build:v7
python3 -m http.server 4173
```

## 质量门

```bash
npm run test:v7
```

每次 Pages 部署必须通过严格 TypeScript 编译、旧内容数据化导出、真实 V7 全生命周期模拟和移动 WebKit 回归。Nightly 还会跑更大的 Monte Carlo。
