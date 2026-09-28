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

// 网站基础信息来自「参考材料/华科网页制作.docx」。
// 研究方向页文案依据 2026-09-25 提供的「参考材料/内容.docx」更新。
// 原文为「拟下设」实验室。成员资料维护在 people.ts，真实论文和联系方式尚未提供。
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

export const research = {
  name: "认知大模型与数据智能体",
  englishName: "Cognitive Large Models and Data Intelligence",
  introduction:
    "Computer Science Lab (CSL) 以大模型与智能体为核心，融合认知科学、数据科学与类脑计算，研究智能系统如何从海量多模态数据与持续环境交互中形成感知、记忆、联想、推理、规划与决策能力，探索认知能力的形成机制及其与数据、知识和经验之间的关系，构建具备持续学习、自主执行与可信决策能力的认知大模型和数据智能体。",
  overview: [
    "重点研究大模型与智能体的认知架构、多模态数据融合、模型训练与自演进、持续学习与记忆机制、稀疏激活与高效计算，以及模型对齐、安全与机制可解释性。下游聚焦医学、金融、地球科学等场景落地。",
    "同时，借鉴人脑的记忆、联想与推理机制，开展大模型与智能体的机制可解释性研究，揭示知识表征、推理规划与决策行为的内在规律。在此基础上，面向科学问题提出、研究假设生成、实验设计与结果验证等科研环节，构建可解释、可验证、可持续演进的科研智能体，推动自动化科研与科学发现，形成“认知启发—机制解析—能力提升—科学探索”相互促进的研究体系。",
  ],
  interdisciplinary:
    "上述方向与医学健康、时空计算、具身智能等方向交叉，面向医学落地、地球科学和自主无人系统等场景，构建数据驱动、认知启发、安全可信的通用大模型与数据智能新范式。",
};

export const researchTopics: ResearchTopic[] = [
  {
    title: "智能体训练与优化",
    english: "Agent Training and Optimization",
    description:
      "研究面向复杂任务的大模型与智能体训练方法，探索监督微调、强化学习与高效推理的协同优化机制。围绕持续学习、记忆增强和环境反馈，提升智能体的知识积累与自演进能力，兼顾新知识学习与核心能力保持。结合多智能体协同和工具使用，增强自主规划、长程任务执行与动态环境适应能力。",
    keywords: [
      "强化学习与高效优化",
      "持续学习与记忆演进",
      "多智能体协同与工具使用",
    ],
  },
  {
    title: "可解释性与安全可信",
    english: "Interpretability, Safety and Trustworthiness",
    description:
      "借鉴人脑信息加工与认知机制，研究大模型与智能体的内部表征、功能组件和计算回路，揭示知识存储、推理规划与决策行为的形成规律。围绕模型对齐、隐私保护与执行安全，探索因果归因、风险评估和靶向干预方法，以机制解析指导能力优化与风险防护，构建可解释、可验证、可控的可信智能系统。",
    keywords: [
      "机制解析与因果归因",
      "模型对齐与安全评估",
      "隐私保护与可信执行",
    ],
  },
  {
    title: "具身智能与世界模型",
    english: "Embodied Intelligence and World Models",
    description:
      "面向真实物理环境，研究多模态感知、空间认知与感知—行动协同机制，构建能够表征环境状态、预测动态变化和推演行动后果的世界模型。探索世界模型驱动的规划决策、具身技能学习与虚实迁移，提升智能体在开放环境中的自主探索、物理交互和复杂任务执行能力。",
    keywords: [
      "多模态感知与空间认知",
      "世界建模与预测规划",
      "具身技能与虚实迁移",
    ],
  },
  {
    title: "AI4S与科学发现",
    english: "AI for Science and Scientific Discovery",
    description:
      "面向科学问题提出、研究假设生成、实验设计与结果验证，研究科学知识表示、数据驱动建模和规律发现方法。构建融合领域知识、科学计算工具与实验反馈的科研智能体，探索多智能体协同的自动化科研流程，推动数据分析、理论建模与实验验证相互促进，支撑可追溯、可复现的科学探索。",
    keywords: [
      "科学知识与假设生成",
      "科学建模与规律发现",
      "科研智能体与实验闭环",
    ],
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
