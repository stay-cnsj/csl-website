export type PublicationLinkKind =
  "paper" | "code" | "project" | "dataset" | "other";

export interface PublicationLink {
  kind: PublicationLinkKind;
  label: string;
  href: string;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  authors: string[];
  isPlaceholder?: boolean;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  highlights?: {
    label: string;
    text: string;
  }[];
  venue?: string;
  year?: number;
  links?: PublicationLink[];
}

// 当前两项为用户要求发布的版式占位；收到正式论文后替换，见 docs/publications.md。
export const publications: Publication[] = [
  {
    id: "placeholder-agent-training",
    title: "智能体训练与优化：从任务学习到持续演进",
    isPlaceholder: true,
    description:
      "本条为论文展示占位，主题取自实验室研究方向。后续将以正式论文摘要与配图替换，介绍智能体在训练、反馈与持续学习方面的研究工作。以下内容仅展示主题与排版，不代表已发表成果。",
    authors: [],
    image: {
      src: "images/publications/agent-training-placeholder.svg",
      alt: "智能体训练流程示意配图，展示数据与任务、训练与反馈、记忆与更新；用于论文占位",
      width: 1200,
      height: 760,
    },
    highlights: [
      {
        label: "训练与反馈",
        text: "围绕任务学习与反馈优化组织研究内容。",
      },
      {
        label: "记忆与更新",
        text: "关注智能体的经验积累与持续学习。",
      },
      {
        label: "研究展示",
        text: "正式论文发布时补充方法、实验与结论。",
      },
    ],
  },
  {
    id: "placeholder-science-agent",
    title: "科研智能体与科学发现：从问题到实验反馈",
    isPlaceholder: true,
    description:
      "本条为论文展示占位，主题对应 AI4S 与科学发现方向。后续将以正式论文材料替换，介绍科研智能体在问题分析、假设生成与实验验证中的研究工作。配图为概念流程示意，不包含真实实验结果。",
    authors: [],
    image: {
      src: "images/publications/science-agent-placeholder.svg",
      alt: "科学发现流程示意配图，展示科学问题、假设生成、实验验证与结果分析；用于论文占位",
      width: 1200,
      height: 760,
    },
    highlights: [
      {
        label: "科学问题",
        text: "从研究问题出发，梳理知识与探索目标。",
      },
      {
        label: "假设与验证",
        text: "呈现假设生成、实验验证与反馈的研究流程。",
      },
      {
        label: "成果说明",
        text: "正式论文发布时补充实验依据与相关资源。",
      },
    ],
  },
];
