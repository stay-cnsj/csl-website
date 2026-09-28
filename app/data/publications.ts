import publicationData from "../../public/content/publications.json";
import { parsePublicationDocument } from "../utils/publicationValidation";

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
  authors: string[];
  abstract: string;
  venue?: string;
  year?: number;
  pages?: string;
  isPlaceholder?: boolean;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  links: PublicationLink[];
}

export interface PublicationDocument {
  schemaVersion: 1;
  publications: Publication[];
}

export const publications: Publication[] =
  parsePublicationDocument(publicationData).publications;
