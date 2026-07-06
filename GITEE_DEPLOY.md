# Gitee Pages 部署指南（免费 · 国内稳定）

本指南帮你在 Gitee Pages 上免费托管「视唱练耳与乐理水平评估」应用，学生通过国内可访问的网址打开。

> 适用前提：应用是**纯前端单页应用**，题库写在代码里。部署本质就是"把 `dist/` 构建产物放到 Gitee 仓库，由 Gitee Pages 托管"。

---

## 一、Gitee Pages 免费版的两个现实

1. **只托管静态文件，不自动构建源码**。所以需要先把项目 `build` 成 `dist/`，再把 `dist` 内容放进 Gitee 仓库。
2. **免费版不会自动重新部署**。每次更新内容后，需回到 Gitee Pages 页面点一次「更新」。（Pro 版才自动）

> 本仓库已配置 `vite.config.ts` 的 `base: './'`，产物可放在任意子路径下正常工作。

---

## 二、方式 A：手动部署（最简单，适合偶尔更新）

### 1. 准备 Gitee 仓库
- 注册并登录 [Gitee](https://gitee.com)，完成**实名认证**（Gitee Pages 强制要求）。
- 新建仓库（建议公开，私有仓库 Pages 需 Pro），仓库名例如 `aural-theory-assessment`。

### 2. 把构建产物放进仓库
- 把本地 `dist/` 目录下的**全部内容**上传到 Gitee 仓库根目录（或建一个 `docs/` 目录放进去）。
  - 即 Gitee 仓库里要有 `index.html`、`assets/` 等。
- 提交推送。

### 3. 开启 Gitee Pages
- 进入仓库 → 顶部「服务」→「Gitee Pages」。
- 部署分支：选你放产物的分支（如 `master`）。
- 部署目录：放根目录就选 `/`，放 `docs` 就选 `/docs`。
- 勾选「强制使用 HTTPS」，点击「启动」。
- 几秒后获得访问地址：`https://<你的Gitee用户名>.gitee.io/<仓库名>/`

### 4. 以后更新
- 改完 GitHub 源码 → 本地 `npm run build` → 把新 `dist` 内容更新到 Gitee 仓库 → 回 Gitee Pages 点「更新」。

---

## 三、方式 B：GitHub Actions 自动同步（推荐，少手动）

> 效果：你只管在 GitHub 改代码并 push，GitHub Actions 会自动构建并把产物同步到 Gitee 的 `gitee-pages` 分支；你只需回 Gitee Pages 点一次「更新」。

### 1. 在 Gitee 生成私人令牌
- Gitee → 设置 → 私人令牌 → 生成，勾选 `projects` 权限，复制 token。

### 2. 在 GitHub 仓库配置 Secrets
- GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret：
  - `GITEE_TOKEN` = 上面的 Gitee 私人令牌
  - `GITEE_USERNAME` = 你的 Gitee 用户名
  - `GITEE_REPO` = 仓库名（如 `aural-theory-assessment`）

### 3. 添加自动同步工作流
> 说明：因部署环境的 GitHub 令牌权限限制，工作流文件未能自动提交。请按下方「手动创建」或「令牌刷新」二选一启用自动同步。

**方式一：在 GitHub 网页手动创建（推荐，无需本地操作）**
1. 进入 GitHub 仓库 → 顶部「Add file」→「Create new file」。
2. 文件名填：`.github/workflows/deploy-gitee.yml`
3. 内容粘贴下方完整 YAML，点「Commit changes」。

**方式二：刷新本地 gh 令牌后推送**
在你的本地终端运行 `gh auth refresh -s workflow`，授权后告诉我，我再把工作流文件推送上去。

**工作流完整内容（deploy-gitee.yml）：**

```yaml
name: Deploy to Gitee Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-and-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Push dist to Gitee (gitee-pages branch)
        env:
          GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
          GITEE_USERNAME: ${{ secrets.GITEE_USERNAME }}
          GITEE_REPO: ${{ secrets.GITEE_REPO }}
        run: |
          set -e
          cd dist
          git init
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
          git push -f "https://${GITEE_USERNAME}:${GITEE_TOKEN}@gitee.com/${GITEE_USERNAME}/${GITEE_REPO}.git" HEAD:gitee-pages
```

- 首次使用：在 Gitee 新建空仓库 → 开启 Gitee Pages，部署分支选 `gitee-pages`、目录 `/`。
- 之后每次 `git push` 到 `main`，Actions 自动构建并推送到 `gitee-pages` 分支。

### 4. 访问地址
- `https://<GITEE_USERNAME>.gitee.io/<GITEE_REPO>/`

---

## 四、常见问题

| 现象 | 原因 / 解决 |
|------|------|
| 页面空白、资源 404 | 多半是 `base` 路径问题。本仓库已设 `base: './'`，正常不会出现；若自行改过，需匹配子路径 |
| 打开是仓库文件列表 | Gitee Pages 未开启或部署目录选错，确认选了含 `index.html` 的分支/目录 |
| 改了代码页面没变 | 免费版需手动点「更新」；确认 Actions 已成功推送 `gitee-pages` 分支 |
| 提示需实名 | Gitee Pages 强制实名，去账号设置完成认证 |

---

## 五、最终给学生用的网址

```
https://<你的Gitee用户名>.gitee.io/<仓库名>/
```

示例：`https://cycyz.gitee.io/aural-theory-assessment/`

把这条发给学生即可，国内访问稳定、免费、无需登录。
