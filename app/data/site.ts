export interface NavigationItem {
  label: string;
  english: string;
  to: string;
}
export interface ResearchTopic {
  title: string;
  english: string;
  description: string;
  keywords: string[];
}

// 网站内容统一维护于此。事实来自「参考材料/华科网页制作.docx」。
// 原文为「拟下设」实验室，尚未提供论文、成员名单或联系方式。
export const site = {
  name: "认知大模型与数据智能",
  englishName: "Cognitive Large Models and Data Intelligence",
  labName: "计算机科学实验室",
  labEnglish: "Computer Science Lab",
  shortName: "CSL",
  principalInvestigator: "曾志刚教授",
  introduction:
    "本方向以大模型为核心，融合认知科学与数据科学，探索智能系统如何从海量多模态数据中形成感知、记忆、联想、推理与决策能力。",
  focus:
    "重点研究大模型与智能体系统的认知架构、微调范式、知识表示与因果推理、多模态数据融合、持续学习与记忆机制、稀疏激活与高效计算、对齐与可解释性等关键问题。",
  inspiration:
    "同时借鉴类脑计算中神经元突触可塑性、事件驱动和分布式存储思想，推动大模型在数据治理、知识发现、复杂系统建模和行业智能决策中的应用。",
  themes:
    "具体包括：大模型与智能体的机制可解释、数据质量与数据飞轮、多智能体协同与具身认知、模型安全与伦理治理等。",
  interdisciplinary:
    "该方向与类脑计算、智能自主无人系统、医学具身、世界模型、地球科学等方向交叉，面向科学发现、医疗健康、金融风控和自主无人系统等场景，构建数据驱动、认知启发、安全可信的通用大模型与数据智能新范式。",
  laboratory:
    "该方向拟下设计算机科学实验室（Computer Science Lab，简称 CSL），由曾志刚教授担任实验室负责人。",
};

export const navigation: NavigationItem[] = [
  { label: "研究方向", english: "Research", to: "/research/" },
  { label: "研究架构", english: "Framework", to: "/framework/" },
  { label: "关于实验室", english: "About CSL", to: "/about/" },
];

export const researchTopics: ResearchTopic[] = [
  {
    title: "认知架构与大模型",
    english: "Cognitive architectures & large models",
    description:
      "研究大模型与智能体系统的认知架构、微调范式、知识表示与因果推理，探索感知、记忆、联想、推理与决策能力的形成机制。",
    keywords: ["认知架构", "知识表示", "因果推理", "微调范式"],
  },
  {
    title: "多模态数据与持续学习",
    english: "Multimodal data & continual learning",
    description:
      "研究多模态数据融合、持续学习与记忆机制、数据质量与数据飞轮，推动数据治理与知识发现。",
    keywords: ["多模态融合", "持续学习", "记忆机制", "数据飞轮"],
  },
  {
    title: "多智能体与类脑计算",
    english: "Multi-agent systems & brain-inspired computing",
    description:
      "研究多智能体协同与具身认知，借鉴神经元突触可塑性、事件驱动和分布式存储思想，探索稀疏激活与高效计算。",
    keywords: ["多智能体协同", "具身认知", "突触可塑性", "高效计算"],
  },
  {
    title: "可解释性与安全可信",
    english: "Interpretability, safety & alignment",
    description:
      "研究大模型与智能体的机制可解释、模型对齐、安全与伦理治理，构建认知启发、安全可信的通用大模型与数据智能新范式。",
    keywords: ["机制可解释", "模型对齐", "模型安全", "伦理治理"],
  },
];

export const frameworkStages = [
  {
    number: "01",
    title: "数据基础与模型训练",
    text: "多模态数据资源、数据治理与质量控制、模型训练与优化，构建高质量数据与高效训练基础。",
  },
  {
    number: "02",
    title: "大模型与认知智能",
    text: "以认知启发为核心，融合认知架构、类脑启发、知识表示与因果推理、多模态融合、持续学习与记忆机制。",
  },
  {
    number: "03",
    title: "关键系统能力",
    text: "智能体架构、世界模型、具身智能、模型安全与伦理治理、数据质量与数据飞轮、机制可解释与可信分析。",
  },
  {
    number: "04",
    title: "重点应用场景",
    text: "面向科学发现、医疗健康、金融风控和自主无人系统，推动复杂系统建模、知识发现与智能决策。",
  },
];
