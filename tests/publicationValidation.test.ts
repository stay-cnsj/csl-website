import assert from "node:assert/strict";
import test from "node:test";
import type { PublicationDocument } from "../app/data/publications.ts";
import {
  fromBase64,
  isHttpsUrl,
  isSafeImageSource,
  parsePublicationDocument,
  toBase64,
  validatePublicationDocument,
} from "../app/utils/publicationValidation.ts";

function validDocument(): PublicationDocument {
  return {
    schemaVersion: 1,
    publications: [
      {
        id: "paper-one",
        title: "认知智能 🧠",
        abstract: "A reproducible abstract.\n中文摘要。",
        authors: ["张三", "Jane Doe"],
        image: {
          src: "images/publications/upload-test.png",
          alt: "研究流程",
          width: 1200,
          height: 800,
        },
        links: [
          {
            kind: "paper",
            label: "论文",
            href: "https://doi.org/10.1234/example",
          },
        ],
      },
    ],
  };
}

test("UTF-8 base64 round trips Chinese, emoji, newlines and long text", () => {
  const original = "论文 🧠 café\n".repeat(4000);
  const encoded = toBase64(original);
  assert.equal(fromBase64(encoded), original);
  assert.equal(fromBase64(encoded.match(/.{1,76}/g)!.join("\n")), original);
  assert.throws(() => fromBase64("/w==")); // Invalid UTF-8 must not silently corrupt text.
});

test("external links accept HTTPS only without embedded credentials", () => {
  assert.equal(isHttpsUrl("https://example.org/a?b=1#section"), true);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,x",
    "http://example.org",
    "//example.org",
    "/relative",
    "https://user:password@example.org",
    "file:///tmp/a",
    "https://",
  ]) {
    assert.equal(isHttpsUrl(url), false, url);
  }
});

test("local image paths cannot escape the publication image directory", () => {
  assert.equal(
    isSafeImageSource("images/publications/research-diagram.svg"),
    true,
  );
  assert.equal(isSafeImageSource("https://example.org/picture.webp"), true);
  for (const path of [
    "../secret.png",
    "images/publications/../secret.png",
    "images/publications/%2e%2e/secret.png",
    "/images/publications/a.png",
    "//example.org/a.png",
    "images/publications/a.png?x=1",
    "images/publications/a.html",
    "data:image/png;base64,AA==",
  ]) {
    assert.equal(isSafeImageSource(path), false, path);
  }
});

test("parser preserves legacy records without citation fields and returns a separate copy", () => {
  const original = validDocument();
  assert.deepEqual(validatePublicationDocument(original), []);
  const parsed = parsePublicationDocument(original);
  assert.deepEqual(parsed, original);
  parsed.publications[0]!.authors.push("Additional author");
  assert.equal(original.publications[0]!.authors.length, 2);
});

test("real publications may omit an abstract, image and links without becoming placeholders", () => {
  const doc = validDocument();
  doc.publications[0]!.abstract = "";
  doc.publications[0]!.links = [];
  delete doc.publications[0]!.image;
  assert.deepEqual(validatePublicationDocument(doc), []);
  assert.deepEqual(parsePublicationDocument(doc), doc);
  assert.equal(doc.publications[0]!.isPlaceholder, undefined);

  doc.publications[0]!.authors = [];
  assert.match(validatePublicationDocument(doc).join("\n"), /作者/);
  doc.publications[0]!.isPlaceholder = true;
  assert.deepEqual(validatePublicationDocument(doc), []);
});

test("citation metadata is optional and preserves confirmed venue, year and pages", () => {
  const doc = validDocument();
  Object.assign(doc.publications[0]!, {
    venue: "Proceedings of the 33rd ACM International Conference on Multimedia (ACM MM)",
    year: 2025,
    pages: "14222-14228",
  });
  assert.deepEqual(parsePublicationDocument(doc), doc);
  for (const year of [1000, 9999]) {
    doc.publications[0]!.year = year;
    assert.deepEqual(validatePublicationDocument(doc), []);
  }
});

test("provided citation metadata must have valid types and stay within limits", () => {
  const invalidFields = [
    { venue: null },
    { venue: 2026 },
    { venue: " " },
    { venue: "x".repeat(501) },
    { year: "2026" },
    { year: null },
    { year: 999 },
    { year: 10000 },
    { year: 2026.5 },
    { pages: null },
    { pages: 123 },
    { pages: " " },
    { pages: "x".repeat(101) },
  ];
  for (const fields of invalidFields) {
    const doc = validDocument();
    Object.assign(doc.publications[0]!, fields);
    assert.ok(validatePublicationDocument(doc).length > 0, JSON.stringify(fields));
    assert.throws(() => parsePublicationDocument(doc));
  }
});

test("optional material still rejects malformed data and unsafe addresses when supplied", () => {
  const invalidFields = [
    { abstract: undefined },
    { abstract: null },
    { abstract: 123 },
    { abstract: "x".repeat(20001) },
    { image: null },
    { image: [] },
    { image: {} },
    { image: { src: "images/publications/../secret.png", alt: "Diagram" } },
    { image: { src: "https://example.org/image.png", alt: "" } },
    { links: undefined },
    { links: null },
    { links: {} },
    { links: [null] },
    { links: [{ kind: "paper", label: "论文", href: "javascript:alert(1)" }] },
    { links: [{ kind: "paper", label: "论文", href: "https://user:password@example.org" }] },
    { links: [{ kind: "paper", label: "论文", href: ["https://example.org"] }] },
  ];
  for (const fields of invalidFields) {
    const doc = validDocument();
    Object.assign(doc.publications[0]!, fields);
    assert.ok(validatePublicationDocument(doc).length > 0, JSON.stringify(fields));
    assert.throws(() => parsePublicationDocument(doc));
  }
});

test("duplicate ids and malformed records cannot be published", () => {
  const doc = validDocument();
  doc.publications.push(structuredClone(doc.publications[0]!));
  assert.match(validatePublicationDocument(doc).join("\n"), /标识无效或重复/);
  for (const input of [
    null,
    [],
    { schemaVersion: 2, publications: [] },
    { schemaVersion: 1, publications: [null] },
  ]) {
    assert.ok(validatePublicationDocument(input).length > 0);
    assert.throws(() => parsePublicationDocument(input));
  }
});

test("record limits and invalid dimensions are enforced before serialization", () => {
  const doc = validDocument();
  doc.publications[0]!.image!.width = 0;
  doc.publications[0]!.image!.height = 2.5;
  doc.publications[0]!.title = "x".repeat(241);
  doc.publications[0]!.links[0]!.href = "javascript:alert(1)";
  assert.equal(validatePublicationDocument(doc).length, 3);
  const tooLarge = validDocument();
  tooLarge.publications = Array.from({ length: 201 }, (_, i) => ({
    ...structuredClone(tooLarge.publications[0]!),
    id: `paper-${i}`,
  }));
  assert.match(validatePublicationDocument(tooLarge).join("\n"), /200/);
});
