import type { PublicationDocument } from "../data/publications.ts";
import {
  fromBase64,
  parsePublicationDocument,
  toBase64,
} from "./publicationValidation.ts";

export const repository = "stay-cnsj/csl-website";
export const contentPath = "public/content/publications.json";
const repoApi = `/repos/${repository}`;
export interface PublicationSnapshot {
  document: PublicationDocument;
  contentSha: string;
  headSha: string;
}
export interface PendingImage {
  path: string;
  content: string;
}
export class GithubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Each browser session owns its credential. It is never stored or sent to any other host.
export class GithubPublications {
  private token: string;
  private transport: typeof fetch;
  constructor(token: string, transport: typeof fetch = fetch) {
    this.token = token.trim();
    this.transport = transport.bind(globalThis);
  }
  disconnect() {
    this.token = "";
  }

  private async request<T>(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
    if (!this.token) throw new GithubError("请先连接 GitHub。", 401);
    let response: Response;
    try {
      response = await this.transport(`https://api.github.com${path}`, {
        method,
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new GithubError(
        "无法连接 GitHub。请检查网络后重试，当前草稿仍保留。",
        0,
      );
    }
    if (!response.ok) {
      const messages: Record<number, string> = {
        401: "GitHub 凭据无效或已过期，请重新连接。",
        403: "GitHub 拒绝了操作。请检查仓库写入权限、令牌权限或请求额度。",
        404: "找不到仓库内容，或当前凭据没有访问权限。",
        409: "远端内容已变化，请读取最新版并核对草稿后再发布。",
        422: "发布未完成：远端分支可能已更新，或仓库规则禁止直接发布。请读取最新版后重试。",
      };
      throw new GithubError(
        messages[response.status] ||
          `GitHub 暂时无法完成操作（${response.status}），请稍后重试。`,
        response.status,
      );
    }
    return response.json() as Promise<T>;
  }

  async connect(): Promise<{ login: string; snapshot: PublicationSnapshot }> {
    const user = await this.request<{ login: string }>("/user");
    const repo = await this.request<{
      permissions?: { push?: boolean };
      default_branch: string;
    }>(repoApi);
    if (!repo.permissions?.push)
      throw new GithubError(
        "此账号尚未获得网站仓库的编辑权限，请联系管理员添加为协作者。",
        403,
      );
    if (repo.default_branch !== "main")
      throw new GithubError(
        "网站发布分支已变更，请联系管理员更新编辑器配置。",
        422,
      );
    return { login: user.login, snapshot: await this.load() };
  }

  async load(): Promise<PublicationSnapshot> {
    const ref = await this.request<{ object: { sha: string } }>(
      `${repoApi}/git/ref/heads/main`,
    );
    const content = await this.request<{
      sha: string;
      content: string;
      encoding: string;
    }>(
      `${repoApi}/contents/${contentPath}?ref=${encodeURIComponent(ref.object.sha)}`,
    );
    if (content.encoding !== "base64")
      throw new Error("论文数据无法读取，请联系管理员检查数据文件大小。");
    return {
      headSha: ref.object.sha,
      contentSha: content.sha,
      document: parsePublicationDocument(
        JSON.parse(fromBase64(content.content)),
      ),
    };
  }

  async publish(
    document: PublicationDocument,
    base: PublicationSnapshot,
    images: PendingImage[] = [],
  ) {
    const parsed = parsePublicationDocument(document);
    if (images.length > 20)
      throw new Error("一次最多上传 20 张图片，请分批发布。");
    for (const image of images) {
      if (
        !/^public\/images\/publications\/upload-[a-z0-9-]+\.(png|jpg|webp)$/.test(
          image.path,
        ) ||
        image.content.length > 4200000 ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(image.content)
      )
        throw new Error("上传图片格式或大小不正确。");
    }
    const latest = await this.load();
    if (latest.contentSha !== base.contentSha)
      throw new GithubError(
        "有其他作者更新了论文列表。当前草稿已保留，请先合并最新版再发布。",
        409,
      );
    const parent = await this.request<{ tree: { sha: string } }>(
      `${repoApi}/git/commits/${latest.headSha}`,
    );
    const content = `${JSON.stringify(parsed, null, 2)}\n`;
    const entries: { path: string; mode: string; type: string; sha: string }[] =
      [];
    const files = [
      ...images,
      { path: contentPath, content: toBase64(content) },
    ];
    for (const file of files) {
      const blob = await this.request<{ sha: string }>(
        `${repoApi}/git/blobs`,
        "POST",
        { content: file.content, encoding: "base64" },
      );
      entries.push({
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      });
    }
    const tree = await this.request<{ sha: string }>(
      `${repoApi}/git/trees`,
      "POST",
      { base_tree: parent.tree.sha, tree: entries },
    );
    const commit = await this.request<{ sha: string; html_url: string }>(
      `${repoApi}/git/commits`,
      "POST",
      {
        message: "Update publications from website editor",
        tree: tree.sha,
        parents: [latest.headSha],
      },
    );
    try {
      await this.request(`${repoApi}/git/refs/heads/main`, "PATCH", {
        sha: commit.sha,
        force: false,
      });
    } catch (error) {
      if (error instanceof GithubError && error.status === 0) {
        // If the response was lost after a successful update, confirm before reporting failure.
        const current = await this.load().catch(() => null);
        if (current?.headSha === commit.sha)
          return { ...current, commitUrl: commit.html_url };
      }
      throw error;
    }
    return {
      document: parsed,
      contentSha: entries[entries.length - 1]!.sha,
      headSha: commit.sha,
      commitUrl: commit.html_url,
    };
  }
}

// Three-way merge by stable paper id: disjoint edits are safe; edits to the same paper require review.
export function mergePublications(
  base: PublicationDocument,
  local: PublicationDocument,
  remote: PublicationDocument,
): { document: PublicationDocument; conflicts: string[] } {
  const lookup = (doc: PublicationDocument) =>
    new Map(doc.publications.map((p) => [p.id, p]));
  const b = lookup(base),
    l = lookup(local),
    r = lookup(remote);
  const conflicts: string[] = [];
  const equal = (a: unknown, c: unknown) =>
    JSON.stringify(a) === JSON.stringify(c);
  const selected = new Map<
    string,
    PublicationDocument["publications"][number]
  >();
  for (const id of new Set([...b.keys(), ...l.keys(), ...r.keys()])) {
    const before = b.get(id),
      mine = l.get(id),
      theirs = r.get(id);
    let value;
    if (equal(mine, before)) value = theirs;
    else if (equal(theirs, before) || equal(mine, theirs)) value = mine;
    else {
      conflicts.push(mine?.title || theirs?.title || id);
      continue;
    }
    if (value) selected.set(id, value);
  }
  const sharedIds = base.publications
    .map((p) => p.id)
    .filter((id) => l.has(id) && r.has(id));
  const order = (doc: PublicationDocument) =>
    doc.publications.map((p) => p.id).filter((id) => sharedIds.includes(id));
  const mineReordered = !equal(order(base), order(local));
  const theirsReordered = !equal(order(base), order(remote));
  if (mineReordered && theirsReordered && !equal(order(local), order(remote)))
    conflicts.push("论文排列顺序");
  const priority = mineReordered ? local : remote;
  const secondary = mineReordered ? remote : local;
  const ids = priority.publications
    .map((p) => p.id)
    .filter((id) => selected.has(id));
  const otherIds = secondary.publications.map((p) => p.id);
  for (const [index, id] of otherIds.entries()) {
    if (!selected.has(id) || ids.includes(id)) continue;
    const next = otherIds
      .slice(index + 1)
      .find((candidate) => ids.includes(candidate));
    if (next) ids.splice(ids.indexOf(next), 0, id);
    else ids.push(id);
  }
  return {
    document: {
      schemaVersion: 1,
      publications: ids.flatMap((id) =>
        selected.has(id) ? [structuredClone(selected.get(id)!)] : [],
      ),
    },
    conflicts,
  };
}
