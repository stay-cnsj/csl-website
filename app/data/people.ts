export interface Person {
  id: string;
  name: string;
  role?: string;
  biography?: string[];
  research: string;
  researchLabel?: string;
  portrait: { src: string; width: number; height: number; position?: string };
  homepage?: string;
}

export interface PeopleGroup {
  id: "leadership" | "postdocs" | "masters" | "research-assistants";
  title: string;
  english: string;
  layout: "featured" | "wide" | "grid";
  people: Person[];
}

// 姓名、身份、研究方向与主页来自「参考材料/CSL-web」中的个人 DOCX。
// 分组与顺序按本次提供的成员层级；个人身份保留原文表述。
export const peopleGroups: PeopleGroup[] = [
  {
    id: "leadership",
    title: "负责人",
    english: "LEADERSHIP",
    layout: "featured",
    people: [
      {
        id: "zeng-zhigang",
        name: "曾志刚",
        biography: [
          "华中科技大学教授、人工智能与自动化学院院长、国家杰出青年科学基金获得者、教育部“长江学者”特聘教授、国家“万人计划”科技创新领军人才、IEEE Fellow",
        ],
        researchLabel: "研究方向（AI）",
        research: "智能体系统、AI安全、大模型优化与可解释性",
        portrait: {
          src: "images/people/zeng-zhigang.jpg",
          width: 536,
          height: 608,
        },
        homepage:
          "https://scholar.google.com/citations?user=BrJUTvoAAAAJ&hl=en",
      },
    ],
  },
  {
    id: "postdocs",
    title: "博后",
    english: "POSTDOCTORAL RESEARCHERS",
    layout: "wide",
    people: [
      {
        id: "wang-kun",
        name: "王琨",
        role: "NTU Research Fellow",
        research: "AI安全、智能体系统、可解释性",
        portrait: {
          src: "images/people/wang-kun.jpg",
          width: 1216,
          height: 812,
          position: "left center",
        },
        homepage:
          "https://scholar.google.com/citations?user=UnyqjWQAAAAJ&hl=en&oi=sra",
      },
      {
        id: "li-qiankun",
        name: "李乾坤",
        role: "NTU Research Fellow（博后研究员）",
        research:
          "AI4Health&Science, Trustworthy AI, Computer Vision, Pattern Recognition",
        portrait: {
          src: "images/people/li-qiankun.jpg",
          width: 326,
          height: 489,
        },
        homepage: "https://qklee-lz.github.io",
      },
    ],
  },
  {
    id: "masters",
    title: "硕士",
    english: "MASTER’S STUDENTS",
    layout: "grid",
    people: [
      {
        id: "he-tiancheng",
        name: "何天成",
        role: "26级硕士",
        research: "大模型创造力，后训练，可解释",
        portrait: {
          src: "images/people/he-tiancheng.png",
          width: 396,
          height: 495,
        },
        homepage: "https://tianchenggg.github.io",
      },
      {
        id: "huang-shiying",
        name: "黄诗颖",
        role: "26级硕士",
        research: "大模型可信与对齐",
        portrait: {
          src: "images/people/huang-shiying.jpg",
          width: 763,
          height: 1024,
        },
      },
      {
        id: "xie-fangzhou",
        name: "解方舟",
        role: "26级硕士",
        research: "智能体强化学习，自进化，大模型后训练",
        portrait: {
          src: "images/people/xie-fangzhou.jpg",
          width: 1109,
          height: 740,
        },
      },
      {
        id: "cui-haodong",
        name: "崔浩东",
        role: "26级硕士",
        research: "具身智能、世界模型、多模态大模型",
        portrait: {
          src: "images/people/cui-haodong.png",
          width: 411,
          height: 411,
        },
        homepage: "https://haodongcui.github.io",
      },
      {
        id: "gao-runyu",
        name: "高润宇",
        role: "27级硕士",
        research: "多模态幻觉",
        portrait: {
          src: "images/people/gao-runyu.png",
          width: 1122,
          height: 1402,
        },
      },
      {
        id: "chen-liqun",
        name: "陈立群",
        role: "27级硕士",
        research: "认知大模型与智能体",
        portrait: {
          src: "images/people/chen-liqun.png",
          width: 519,
          height: 726,
        },
      },
      {
        id: "wang-wenjie",
        name: "王文杰",
        role: "27级硕士",
        research: "智能体，模型后训练",
        portrait: {
          src: "images/people/wang-wenjie.jpg",
          width: 490,
          height: 654,
        },
      },
      {
        id: "chen-siyuan",
        name: "陈思远",
        role: "27级硕士",
        research:
          "Agent（RSI，创造力），GraphReasoning（AgenticRL，Knowledge Representation），AI4S（AI4AI，AI4Research，科学发现）",
        portrait: {
          src: "images/people/chen-siyuan.jpg",
          width: 1280,
          height: 1636,
        },
        homepage: "https://siyuanchentodo.github.io/",
      },
    ],
  },
  {
    id: "research-assistants",
    title: "RA",
    english: "RESEARCH ASSISTANTS",
    layout: "wide",
    people: [
      {
        id: "pang-yuchen",
        name: "庞羽晨",
        role: "RA",
        research: "智能体训练与优化",
        portrait: {
          src: "images/people/pang-yuchen.jpg",
          width: 375,
          height: 530,
        },
      },
      {
        id: "shao-tianyu",
        name: "邵天宇",
        role: "24级本科生",
        research: "世界模型、具身智能",
        portrait: {
          src: "images/people/shao-tianyu.jpg",
          width: 485,
          height: 706,
        },
      },
    ],
  },
];
