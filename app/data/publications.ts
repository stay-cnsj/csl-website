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

// 仅添加经确认的真实成果；填写方法见 docs/publications.md。
export const publications: Publication[] = [];
