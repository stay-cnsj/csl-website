import type { PublicationDocument } from "../data/publications.ts";

export function isSafeImageSource(value: string): boolean {
  return (
    isHttpsUrl(value) ||
    /^images\/publications\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpe?g|webp|gif|svg)$/.test(
      value,
    )
  );
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !!url.hostname &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function validatePublicationDocument(input: unknown): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return ["论文数据格式不正确。"];
  const doc = input as PublicationDocument;
  if (doc.schemaVersion !== 1 || !Array.isArray(doc.publications))
    return ["论文数据版本或列表格式不正确。"];
  if (doc.publications.length > 200) errors.push("论文数量不能超过 200 篇。");
  const ids = new Set<string>();
  const text = (value: unknown, max: number) =>
    typeof value === "string" && !!value.trim() && value.length <= max;
  doc.publications.forEach((p, index) => {
    const prefix = `第 ${index + 1} 篇：`;
    if (!p || typeof p !== "object") {
      errors.push(`${prefix}格式不正确。`);
      return;
    }
    if (
      typeof p.id !== "string" ||
      !/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.id) ||
      ids.has(p.id)
    )
      errors.push(`${prefix}标识无效或重复。`);
    ids.add(p.id);
    if (!text(p.title, 240))
      errors.push(`${prefix}请填写标题（最多 240 字）。`);
    if (typeof p.abstract !== "string" || p.abstract.length > 20000)
      errors.push(`${prefix}Abstract 须为文字，可留空（最多 20,000 字）。`);
    if (p.venue !== undefined && !text(p.venue, 500))
      errors.push(`${prefix}会议或期刊须为文字（最多 500 字）。`);
    if (
      p.year !== undefined &&
      (!Number.isInteger(p.year) || p.year < 1000 || p.year > 9999)
    )
      errors.push(`${prefix}年份须为 1000–9999 的整数。`);
    if (p.pages !== undefined && !text(p.pages, 100))
      errors.push(`${prefix}页码须为文字（最多 100 字）。`);
    if (p.isPlaceholder !== undefined && typeof p.isPlaceholder !== "boolean")
      errors.push(`${prefix}占位标记无效。`);
    if (
      !Array.isArray(p.authors) ||
      p.authors.length > 50 ||
      p.authors.some((a) => !text(a, 120)) ||
      (!p.isPlaceholder && p.authors.length === 0)
    )
      errors.push(`${prefix}请按顺序填写作者（每行一位）。`);
    if (
      p.image !== undefined &&
      (!p.image || typeof p.image !== "object" || Array.isArray(p.image))
    ) {
      errors.push(`${prefix}图片格式不正确。`);
    } else if (p.image) {
      if (typeof p.image.src !== "string" || !isSafeImageSource(p.image.src))
        errors.push(`${prefix}图片须为 HTTPS 地址或已上传的论文图片。`);
      if (!text(p.image.alt, 500)) errors.push(`${prefix}请填写图片说明。`);
      for (const dimension of [p.image.width, p.image.height]) {
        if (
          dimension !== undefined &&
          (!Number.isInteger(dimension) || dimension < 1 || dimension > 20000)
        )
          errors.push(`${prefix}图片尺寸无效。`);
      }
    }
    if (!Array.isArray(p.links) || p.links.length > 10) {
      errors.push(`${prefix}链接须为列表，可留空（最多 10 个）。`);
    } else if (
      p.links.some(
        (link) =>
          !link ||
          !["paper", "code", "project", "dataset", "other"].includes(
            link.kind,
          ) ||
          !text(link.label, 60) ||
          typeof link.href !== "string" ||
          !isHttpsUrl(link.href),
      )
    ) {
      errors.push(`${prefix}链接需包含名称和有效的 HTTPS 地址。`);
    }
  });
  if (new TextEncoder().encode(JSON.stringify(doc)).length > 800000)
    errors.push("论文文字总量过大，请缩短摘要后再发布。");
  return [...new Set(errors)];
}

export function parsePublicationDocument(input: unknown): PublicationDocument {
  const errors = validatePublicationDocument(input);
  if (errors.length) throw new Error(errors.join("\n"));
  return structuredClone(input as PublicationDocument);
}

export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary);
}

export function fromBase64(value: string): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(atob(value.replace(/\s/g, "")), (c) => c.charCodeAt(0)),
  );
}
