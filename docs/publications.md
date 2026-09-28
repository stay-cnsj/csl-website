# 研究成果维护

论文内容统一保存在 `public/content/publications.json`，通过网页编辑器 `/editor/` 维护。线上访问时保留网站原有的基础路径，例如 `https://stay-cnsj.github.io/csl-website/editor/`。列表顺序就是网页展示顺序。

网站按“标题 → 作者 → Abstract → 论文及相关链接”展示每篇论文。桌面端图片与文字交替排列，手机端图片在前、正文在后。所有文字均按纯文本显示，不支持 HTML。

目前两篇记录仍是明确标注的占位示例，分别对应智能体训练与优化、科研智能体与科学发现。占位摘要和配图仅用于说明主题与版式，不代表真实论文或实验结果。作者和链接为空时，页面显示“作者待补充”和“论文链接待补充”。发布真实论文时，请替换标题、作者、Abstract、配图与真实链接，并移除占位标记。

## 通过网页编辑

1. 打开 `/editor/`，读取当前论文列表。
2. 新增、编辑或删除论文；调整顺序以决定主页的展示顺序。
3. 按论文署名顺序填写作者，填写准确的 Abstract 和真实链接；上传论文配图并填写替代文字。图片与文字会在同一次提交中保存。
4. 检查草稿和预览后，使用自己的 GitHub 令牌保存到仓库。
5. 保存成功后，网站会自动构建并部署，通常约 1 分钟更新。部署完成前，线上页面仍可能显示旧内容。

编辑器直接连接 GitHub，不需要网站后台服务器。修改目标固定为仓库 `stay-cnsj/csl-website` 的 `main` 分支。

## 协作者权限

每位编辑者都应使用自己的 GitHub 账号，并先成为 `stay-cnsj/csl-website` 仓库中具有写入权限的协作者，接受仓库邀请后再连接。

- 仓库所有者 `stay-cnsj`：可创建 fine-grained token，仅选择本仓库，授予 **Contents: Read and write**。
- 当前个人仓库的其他协作者：GitHub 暂不支持其使用 fine-grained token 访问此类仓库，需要使用 classic token，选择 **public_repo**。此权限覆盖该账号可写入的公开仓库，无法只限制为本仓库；建议设置较短有效期。官方说明见 [fine-grained token 限制](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#fine-grained-personal-access-tokens-limitations)。

编辑器不是独立邮箱/密码账号系统。GitHub 的仓库权限负责鉴权，拥有写入权限的协作者也可修改仓库其他内容。不要向不应具备仓库写入权限的人发放编辑权限，不要共用所有者令牌。

在编辑器中输入个人令牌即可保存。令牌仅保存在当前页面的运行内存中，不写入仓库、浏览器持久存储或论文数据；刷新或关闭页面后需要重新输入。不要共享令牌，也不要把令牌填写在作者、摘要或链接等内容字段中。

## 同时编辑与保存

编辑器保存时会读取仓库最新内容并检查是否发生变化。不同论文的独立修改可与最新版本合并；同一篇论文发生冲突时会阻止覆盖，并保留当前草稿，供编辑者核对后处理。保存不是强制覆盖远端分支。

新上传的图片和论文 JSON 通过一次原子提交保存，避免出现正文已经更新而图片尚未提交的中间状态。保存成功表示 GitHub 已收到提交，网站更新仍需等待自动部署完成。

## 数据结构

`app/data/publications.ts` 导出类型并加载 JSON，使用与编辑器相同的 `parsePublicationDocument` 校验后提供给展示组件。数据格式如下：

```json
{
  "schemaVersion": 1,
  "publications": []
}
```

| 字段                           | 类型                                           | 用法                                                             |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------- |
| `schemaVersion`                | `1`                                            | 必填，当前数据格式版本                                           |
| `publications`                 | `Publication[]`                                | 必填，数组顺序就是网页展示顺序；空数组显示“研究论文将陆续发布。” |
| `publications[].id`            | `string`                                       | 必填，唯一且稳定，使用小写字母、数字和短横线                     |
| `title`                        | `string`                                       | 必填，准确的论文标题                                             |
| `authors`                      | `string[]`                                     | 必填，按实际署名顺序填写；仅占位记录可为空                       |
| `abstract`                     | `string`                                       | 必填，准确的论文摘要；保留文字换行                               |
| `isPlaceholder`                | `boolean`                                      | 可选；`true` 显示占位提示，正式论文应删除该标记                  |
| `image`                        | 对象                                           | 类型允许省略；编辑器要求正式论文提供配图                         |
| `image.src`                    | `string`                                       | 已上传图片的本地路径，或有效 HTTPS 图片地址                      |
| `image.alt`                    | `string`                                       | 配图的准确文字说明                                               |
| `image.width` / `image.height` | `number`                                       | 可选，实际像素尺寸                                               |
| `links`                        | `PublicationLink[]`                            | 必填；仅占位记录可为空                                           |
| `links[].kind`                 | `paper`、`code`、`project`、`dataset`、`other` | 链接类别                                                         |
| `links[].label`                | `string`                                       | 显示文字，例如“论文”或“代码”                                     |
| `links[].href`                 | `string`                                       | 真实、完整的 HTTPS 地址                                          |

不再使用 `description`、`highlights`、`venue` 或 `year` 字段。不要在缺少真实材料时填入虚构作者、链接、实验数据或发表信息。

本地图片放在 `public/images/publications/`，数据中填写 `images/publications/文件名.png`；组件会添加网站基础路径，请勿手动写入 `public/` 或 `/csl-website/`。当前两张 SVG 是已有的占位流程图，正式论文应替换为经确认的论文配图。

## 手动维护与检查

也可直接编辑 JSON，并将图片加入对应目录。提交前检查桌面与手机的显示效果，运行 `npm run typecheck` 和 `npm run generate`。如需安装项目依赖，使用 `cnpm i --by=npm`，遵循仓库的 `package-lock.json`。
