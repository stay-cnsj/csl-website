import assert from "node:assert/strict";
import test from "node:test";
import type {
  Publication,
  PublicationDocument,
} from "../app/data/publications.ts";
import {
  contentPath,
  GithubError,
  GithubPublications,
  mergePublications,
} from "../app/utils/githubPublications.ts";
import type { PublicationSnapshot } from "../app/utils/githubPublications.ts";
import { fromBase64, toBase64 } from "../app/utils/publicationValidation.ts";

function paper(id: string, abstract = `Abstract for ${id}`): Publication {
  return {
    id,
    title: `Paper ${id}`,
    abstract,
    authors: ["Author"],
    image: { src: "https://example.org/image.png", alt: "Figure" },
    links: [
      { kind: "paper", label: "Paper", href: "https://example.org/paper" },
    ],
  };
}
function doc(...papers: Publication[]): PublicationDocument {
  return { schemaVersion: 1, publications: papers };
}
const baseDocument = () => doc(paper("a"), paper("b"), paper("c"));
const ids = (document: PublicationDocument) =>
  document.publications.map((p) => p.id);

test("three-way merge preserves disjoint edits and independent additions/deletions", () => {
  const base = baseDocument();
  const local = doc(
    paper("a", "local edit"),
    paper("b"),
    paper("c"),
    paper("new-local"),
  );
  const remote = doc(
    paper("a"),
    paper("b", "remote edit"),
    paper("new-remote"),
  );
  const merged = mergePublications(base, local, remote);
  assert.deepEqual(merged.conflicts, []);
  assert.equal(
    merged.document.publications.find((p) => p.id === "a")!.abstract,
    "local edit",
  );
  assert.equal(
    merged.document.publications.find((p) => p.id === "b")!.abstract,
    "remote edit",
  );
  assert.equal(
    merged.document.publications.some((p) => p.id === "c"),
    false,
  );
  assert.ok(ids(merged.document).includes("new-local"));
  assert.ok(ids(merged.document).includes("new-remote"));
  assert.equal(base.publications[0]!.abstract, "Abstract for a");
});

test("same-paper edit/edit and edit/delete conflicts are surfaced", () => {
  const base = doc(paper("a"));
  assert.deepEqual(
    mergePublications(base, doc(paper("a", "mine")), doc(paper("a", "theirs")))
      .conflicts,
    ["Paper a"],
  );
  assert.deepEqual(
    mergePublications(base, doc(), doc(paper("a", "theirs"))).conflicts,
    ["Paper a"],
  );
  assert.deepEqual(
    mergePublications(base, doc(paper("a", "same")), doc(paper("a", "same")))
      .conflicts,
    [],
  );
});

test("conflicting reorder is surfaced, while a one-sided reorder is preserved", () => {
  const base = baseDocument();
  const local = doc(paper("b"), paper("a"), paper("c"));
  const remote = doc(paper("a"), paper("c"), paper("b"));
  assert.ok(
    mergePublications(base, local, remote).conflicts.includes("论文排列顺序"),
  );
  assert.deepEqual(ids(mergePublications(base, local, base).document), [
    "b",
    "a",
    "c",
  ]);
});

test("merging an unchanged remote must preserve a new local paper at the top", () => {
  const base = doc(paper("a"), paper("b"));
  const local = doc(paper("new-local"), paper("a"), paper("b"));
  assert.deepEqual(mergePublications(base, local, base), {
    document: local,
    conflicts: [],
  });
});

test("disjoint remote edit must not move a new local paper from top to bottom", () => {
  const base = doc(paper("a"), paper("b"));
  const local = doc(paper("new-local"), paper("a"), paper("b"));
  const remote = doc(paper("a"), paper("b", "remote edit"));
  const merged = mergePublications(base, local, remote);
  assert.deepEqual(merged.conflicts, []);
  assert.deepEqual(ids(merged.document), ["new-local", "a", "b"]);
  assert.equal(merged.document.publications[2]!.abstract, "remote edit");
});

interface Call {
  url: string;
  method: string;
  body: any;
  headers: Headers;
}
function mockApi(
  options: {
    contentSha?: string;
    patchStatus?: number;
    losePatchResponse?: boolean;
  } = {},
) {
  const calls: Call[] = [];
  let patched = false;
  let blob = 0;
  const transport = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call = {
      url: String(input),
      method: init?.method || "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
      headers: new Headers(init?.headers),
    };
    calls.push(call);
    assert.ok(call.url.startsWith("https://api.github.com/"));
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    const json = (value: unknown, status = 200) =>
      new Response(JSON.stringify(value), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    if (call.url.endsWith("/git/ref/heads/main"))
      return json({ object: { sha: patched ? "new-commit" : "latest-head" } });
    if (call.url.includes(`/contents/${contentPath}?ref=`))
      return json({
        sha: options.contentSha || "same-content",
        content: toBase64(JSON.stringify(baseDocument())),
        encoding: "base64",
      });
    if (call.url.endsWith("/git/commits/latest-head"))
      return json({ tree: { sha: "latest-tree" } });
    if (call.url.endsWith("/git/blobs"))
      return json({ sha: `blob-${++blob}` }, 201);
    if (call.url.endsWith("/git/trees")) return json({ sha: "new-tree" }, 201);
    if (call.method === "POST" && call.url.endsWith("/git/commits"))
      return json(
        {
          sha: "new-commit",
          html_url:
            "https://github.com/stay-cnsj/csl-website/commit/new-commit",
        },
        201,
      );
    if (call.method === "PATCH" && call.url.endsWith("/git/refs/heads/main")) {
      if (options.patchStatus)
        return json({ message: "Conflict" }, options.patchStatus);
      patched = true;
      if (options.losePatchResponse)
        throw new TypeError("Connection closed after commit");
      return json({ object: { sha: "new-commit" } });
    }
    throw new Error(`Unexpected mocked call: ${call.method} ${call.url}`);
  }) as typeof fetch;
  return { calls, transport };
}
function snapshot(): PublicationSnapshot {
  return {
    document: baseDocument(),
    contentSha: "same-content",
    headSha: "old-head",
  };
}

test("publish preserves freshest tree and atomically commits image plus JSON without force", async () => {
  const { calls, transport } = mockApi();
  const client = new GithubPublications(
    "test-only-not-a-real-token",
    transport,
  );
  const updated = baseDocument();
  updated.publications[0]!.abstract = "中文更新 🧠";
  const result = await client.publish(updated, snapshot(), [
    { path: "public/images/publications/upload-test.png", content: "AA==" },
  ]);
  const writes = calls.filter((call) => call.method !== "GET");
  assert.deepEqual(
    writes.map((call) => call.method),
    ["POST", "POST", "POST", "POST", "PATCH"],
  );
  assert.deepEqual(writes[2]!.body, {
    base_tree: "latest-tree",
    tree: [
      {
        path: "public/images/publications/upload-test.png",
        mode: "100644",
        type: "blob",
        sha: "blob-1",
      },
      { path: contentPath, mode: "100644", type: "blob", sha: "blob-2" },
    ],
  });
  assert.deepEqual(writes[3]!.body.parents, ["latest-head"]);
  assert.deepEqual(writes[4]!.body, { sha: "new-commit", force: false });
  assert.deepEqual(JSON.parse(fromBase64(writes[1]!.body.content)), updated);
  assert.equal(result.contentSha, "blob-2");
  assert.equal(result.headSha, "new-commit");
  assert.ok(calls[1]!.url.endsWith("?ref=latest-head"));
});

test("stale content is rejected before creating any blobs or commits", async () => {
  const { calls, transport } = mockApi({ contentSha: "someone-else-saved" });
  await assert.rejects(
    new GithubPublications("test-only", transport).publish(
      baseDocument(),
      snapshot(),
    ),
    (error: unknown) => error instanceof GithubError && error.status === 409,
  );
  assert.ok(calls.every((call) => call.method === "GET"));
});

test("concurrent branch update rejects without retrying as force push", async () => {
  const { calls, transport } = mockApi({ patchStatus: 422 });
  await assert.rejects(
    new GithubPublications("test-only", transport).publish(
      baseDocument(),
      snapshot(),
    ),
    (error: unknown) => error instanceof GithubError && error.status === 422,
  );
  assert.equal(calls.filter((call) => call.method === "PATCH").length, 1);
  assert.equal(calls.at(-1)!.body.force, false);
});

test("a lost successful ref-update response is verified against remote head", async () => {
  const { calls, transport } = mockApi({ losePatchResponse: true });
  const result = await new GithubPublications("test-only", transport).publish(
    baseDocument(),
    snapshot(),
  );
  assert.equal(result.headSha, "new-commit");
  assert.equal(calls.filter((call) => call.method === "PATCH").length, 1);
  assert.ok(calls.at(-1)!.url.endsWith("?ref=new-commit"));
});

test("invalid upload paths and excessive image batches make no network requests", async () => {
  const { calls, transport } = mockApi();
  const client = new GithubPublications("test-only", transport);
  await assert.rejects(
    client.publish(baseDocument(), snapshot(), [
      { path: ".github/workflows/deploy.yml", content: "AA==" },
    ]),
    /上传图片格式/,
  );
  await assert.rejects(
    client.publish(
      baseDocument(),
      snapshot(),
      Array.from({ length: 21 }, (_, i) => ({
        path: `public/images/publications/upload-${i}.png`,
        content: "AA==",
      })),
    ),
    /20/,
  );
  assert.equal(calls.length, 0);
});

test("disconnect removes credential and errors do not expose server body or token", async () => {
  let calls = 0;
  const client = new GithubPublications(
    "test-only-sensitive-value",
    (async () => {
      calls++;
      return new Response(
        "server accidentally echoes test-only-sensitive-value",
        { status: 401 },
      );
    }) as typeof fetch,
  );
  await assert.rejects(
    client.load(),
    (error: unknown) =>
      error instanceof GithubError &&
      error.status === 401 &&
      !error.message.includes("test-only-sensitive-value"),
  );
  client.disconnect();
  await assert.rejects(
    client.load(),
    (error: unknown) => error instanceof GithubError && error.status === 401,
  );
  assert.equal(calls, 1);
});

test("browser fetch keeps its native global receiver", async () => {
  let received = false;
  const transport = async function (this: typeof globalThis) {
    assert.equal(this, globalThis);
    received = true;
    return new Response("{}", { status: 401 });
  } as typeof fetch;
  await assert.rejects(
    new GithubPublications("test-only", transport).load(),
    GithubError,
  );
  assert.equal(received, true);
});
