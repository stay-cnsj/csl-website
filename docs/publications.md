# 研究成果维护

成果数据统一维护在 `app/data/publications.ts`，展示组件为 `app/components/PublicationList.vue`。数组顺序就是网页顺序，可将最新成果放在最前面。

目前参考材料未提供真实论文或成果记录，因此 `publications` 保持空数组，页面显示“研究论文将陆续发布。”。不要把示例记录加入正式数据。

## 添加一项成果

1. 准备经确认的论文标题、摘要说明、作者顺序、研究亮点和对外链接。
2. 如有成果图，放到 `public/images/publications/`。图片使用实际图表、论文配图或经确认的研究示意图，填写真实尺寸与描述性替代文字。
3. 在 `publications` 数组添加一个符合 `Publication` 类型的对象。
4. 本地检查电脑与手机页面，然后运行 `npm run typecheck` 和 `npm run generate`。

## 字段说明

| 字段                           | 类型                                                     | 用法                                                   |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------------ |
| `id`                           | `string`                                                 | 必填，唯一且稳定的标识，建议使用小写英文和短横线       |
| `title`                        | `string`                                                 | 必填，真实论文或成果标题                               |
| `description`                  | `string`                                                 | 必填，简洁准确的成果说明；空字符串不会显示正文段落     |
| `authors`                      | `string[]`                                               | 必填，按论文署名顺序填写；空数组不显示作者栏           |
| `image`                        | 对象                                                     | 可选；没有图片时直接省略，不显示替代图                 |
| `image.src`                    | `string`                                                 | 图片路径，推荐 `images/publications/文件名.png`        |
| `image.alt`                    | `string`                                                 | 图片内容的文字说明                                     |
| `image.width` / `image.height` | `number`                                                 | 可选，建议填写图片实际像素尺寸，保持比例并减少页面跳动 |
| `highlights`                   | `{ label: string; text: string }[]`                      | 可选，逐条列出亮点；`label` 加粗，`text` 为说明        |
| `venue`                        | `string`                                                 | 可选，会议或期刊名称                                   |
| `year`                         | `number`                                                 | 可选，发表年份                                         |
| `links`                        | `PublicationLink[]`                                      | 可选，只填写真实且有效的链接                           |
| `links[].kind`                 | `"paper"`、`"code"`、`"project"`、`"dataset"`、`"other"` | 链接类别                                               |
| `links[].label`                | `string`                                                 | 网页显示的链接文字，例如“论文”或“代码”                 |
| `links[].href`                 | `string`                                                 | 对外 HTTPS 地址或本地文件路径                          |

图片可以省略；亮点、年份、期刊与链接也只在提供实际内容时展示。不要为缺失信息写入“待填写”等占位文字。

本地资源路径相对于 `public/`：例如 `public/papers/result.pdf` 在数据中填写为 `papers/result.pdf`。组件会自动添加 GitHub Pages 的仓库基础路径，请勿手动写入 `/仓库名/` 或 `public/`。外部图片与链接使用完整 HTTPS 地址。链接不会依据类别自动生成，必须填写可访问的 `href`。

## 数据模板

下面只展示字段结构，**不是实际论文，不应原样复制到正式数据**。请替换所有示例文字、日期、链接和文件名；没有的可选字段直接删除。

```ts
{
  id: "replace-with-real-publication-id",
  title: "替换为经确认的真实论文标题",
  description: "替换为真实研究内容、方法及结论的简要说明。",
  authors: ["替换为第一作者", "替换为其他作者"],
  image: {
    src: "images/publications/replace-with-real-figure.png",
    alt: "替换为图片准确的内容描述",
    width: 1200, // 替换为实际图片宽度
    height: 800, // 替换为实际图片高度
  },
  highlights: [
    {
      label: "替换为研究亮点标题",
      text: "替换为有论文依据的说明，不添加未经验证的效果或数据。",
    },
  ],
  venue: "替换为真实会议或期刊",
  year: 2026, // 替换为实际发表年份
  links: [
    {
      kind: "paper",
      label: "论文",
      href: "https://example.com/replace-with-real-paper-link",
    },
  ],
}
```

桌面端的有图成果按行交替显示图片与文字；手机端统一先显示图片，再显示正文。标题区由页面负责，组件只负责成果列表。
