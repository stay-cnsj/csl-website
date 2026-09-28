# 认知大模型与数据智能网站

基于 Nuxt 4、Bootstrap 5 与 TypeScript 的研究方向网站，内容整理自《华科网页制作.docx》。视觉与页面布局参考 [MIT EvLab 网站](https://www.evlab.mit.edu/)，使用本项目的研究内容与图片。

网站生成静态页面，通过 GitHub Pages 自动发布。

- 网站地址：[stay-cnsj.github.io/csl-website](https://stay-cnsj.github.io/csl-website/)
- 源码仓库：[stay-cnsj/csl-website](https://github.com/stay-cnsj/csl-website)
- 发布状态：[GitHub Actions](https://github.com/stay-cnsj/csl-website/actions)

## 本地运行

使用 Node.js 24（24.11.0 或更新版本），并按项目约定通过 `cnpm i` 安装依赖：

```sh
cnpm i --by=npm
npm run dev
```

如果本机没有 cnpm，可临时运行它来安装，无需全局安装：

```sh
npm exec --yes --package=cnpm -- cnpm i --by=npm --registry=https://registry.npmjs.org
npm run dev
```

启动后访问终端提示的本地地址。验证与生成静态网站：

```sh
npm run typecheck
npm test
npm run generate
```

静态发布文件位于 `.output/public/`。该目录由构建产生，不需要提交到 Git。

## 页面与内容维护

| 页面       | 路径          | 文件                      |
| ---------- | ------------- | ------------------------- |
| 首页       | `/`           | `app/pages/index.vue`     |
| 研究方向   | `/research/`  | `app/pages/research.vue`  |
| 研究架构   | `/framework/` | `app/pages/framework.vue` |
| 关于实验室 | `/about/`     | `app/pages/about.vue`     |
| 论文编辑   | `/editor/`    | `app/pages/editor.vue`    |

- 修改实验室名称、方向介绍、研究主题、导航与架构说明：编辑 `app/data/site.ts`。
- 研究方向页的新文案维护在同文件的 `research` 和 `researchTopics`，与首页基础信息分开。
- 添加论文与研究成果：使用 [网页编辑器](https://stay-cnsj.github.io/csl-website/editor/)，支持增删改、排序、配图上传与多人并发检查；也可直接维护 `public/content/publications.json`。权限与步骤见 [研究成果维护](docs/publications.md)。
- 人员介绍按负责人、博后、硕士、RA 分组，维护 `app/data/people.ts`，照片位于 `public/images/people/`。
- 替换研究架构图：更新 `public/images/research-framework.png`，保留同名文件即可；如比例或尺寸改变，同时更新 `app/pages/framework.vue` 中的图片尺寸与替代文字。
- 调整颜色、字体、间距及响应式布局：编辑 `app/assets/css/main.css`。
- 修改搜索结果中的标题与网站描述：检查 `nuxt.config.ts` 以及各页面的 `useSeoMeta`。
- 增加新页面：在 `app/pages/` 添加页面，更新 `app/data/site.ts` 的导航，并在 `nuxt.config.ts` 的预渲染列表中加入路径。

后续素材需求与事实边界见 [内容维护说明](docs/content-notes.md)。未提供的人员、论文和联系方式没有编造为网站内容。

`参考材料/` 与 `.content-extract/` 已加入 `.gitignore`，原始 Word 文档和提取过程文件不随代码提交。网站实际使用的架构图位于 `public/`，会随网站公开。添加文件时不要强制提交原始材料。

## 发布到 GitHub 免费域名

目标账号为 `stay-cnsj`。免费方案可使用公开仓库和 GitHub Pages，无需购买域名。账号站点与项目站点的地址规则见 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)。

| 仓库名称                     | 发布成功后的地址                           |
| ---------------------------- | ------------------------------------------ |
| `stay-cnsj.github.io`        | `https://stay-cnsj.github.io/`             |
| 其他名称，例如 `csl-website` | `https://stay-cnsj.github.io/csl-website/` |

本项目使用 `csl-website` 仓库，发布路径为 `/csl-website/`。

首次发布步骤：

1. 登录 `stay-cnsj`，创建用于本网站的公开 GitHub 仓库。
2. 将项目代码连同 `.github/workflows/deploy.yml` 推送至仓库的 `main` 分支。
3. 打开仓库 **Settings → Pages → Build and deployment**，将 **Source** 设为 **GitHub Actions**。
4. 打开 **Actions → Deploy website to GitHub Pages**。如果首次推送早于 Pages 设置，可点击 **Run workflow** 重新发布。
5. 工作流成功后，从部署记录或 **Settings → Pages** 打开真实访问地址。

后续向 `main` 推送修改会自动检查 TypeScript、运行编辑安全检查、生成静态页面并发布。工作流使用 Node.js 24 和 `cnpm i`，通过 GitHub 内置令牌部署，工作流无需配置个人访问令牌；网页编辑者则使用自己的令牌提交内容。发布方式参照 [GitHub Pages 自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

发布流程会自动根据仓库名设置 `NUXT_APP_BASE_URL`：账号站点使用 `/`，项目站点使用 `/<repo>/`。因此不需要为不同仓库手动修改源码中的链接。若希望本地检查项目子路径的构建，例如：

```sh
NUXT_APP_BASE_URL=/csl-website/ npm run generate
```

此时静态服务器也需要将 `.output/public/` 挂载到 `/csl-website/` 路径下。部署失败时，先查看 Actions 对应步骤的日志；如果网页正常但图片或内部链接失效，检查实际仓库名称与构建时的基础路径是否一致。
