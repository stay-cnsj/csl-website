<script setup lang="ts">
import {
  publications,
  type Publication,
  type PublicationDocument,
  type PublicationLink,
} from "~/data/publications";
import {
  GithubPublications,
  mergePublications,
  repository,
  type PendingImage,
  type PublicationSnapshot,
} from "~/utils/githubPublications";
import {
  isSafeImageSource,
  isHttpsUrl,
  validatePublicationDocument,
} from "~/utils/publicationValidation";

useSeoMeta({ title: "论文编辑 · CSL", robots: "noindex, nofollow" });
const asset = useAssetPath();
const ready = ref(false);
const tokenInput = ref("");
const login = ref("");
const demo = ref(false);
const busy = ref(false);
const imageBusy = ref(false);
const message = ref("");
const error = ref("");
const commitUrl = ref("");
let client: GithubPublications | null = null;
let snapshot: PublicationSnapshot | null = null;
const draft = ref<PublicationDocument>({
  schemaVersion: 1,
  publications: structuredClone(publications),
});
const baseline = ref(JSON.stringify(draft.value));
const pendingImages = new Map<
  string,
  PendingImage & { preview: string; published?: boolean }
>();
const selectedId = ref<string | null>(null);
const form = ref<Publication | null>(null);
const authorsText = ref("");
const originalForm = ref("");
const previewOpen = ref(false);
const deleteId = ref<string | null>(null);
const deleteDialog = useTemplateRef<HTMLDialogElement>("deleteDialog");
watch(deleteId, async (id) => {
  await nextTick();
  if (id) deleteDialog.value?.showModal();
  else deleteDialog.value?.close();
});
const active = computed(() => !!login.value || demo.value);
const draftDirty = computed(
  () => JSON.stringify(draft.value) !== baseline.value,
);
const formDirty = computed(
  () =>
    !!form.value &&
    JSON.stringify({ form: form.value, authors: authorsText.value }) !==
      originalForm.value,
);
const dirty = computed(() => draftDirty.value || formDirty.value);
const locked = computed(() => !ready.value || busy.value || imageBusy.value);
const deleteTitle = computed(
  () => draft.value.publications.find((p) => p.id === deleteId.value)?.title,
);
const imagePreview = computed(() => {
  const src = form.value?.image?.src.trim();
  if (!src || !isSafeImageSource(src)) return "";
  return (
    pendingImages.get(`public/${src}`)?.preview ||
    (isHttpsUrl(src) ? src : asset(src))
  );
});

function announce(text = "") {
  message.value = text;
  error.value = "";
}
function handleError(e: unknown) {
  error.value = e instanceof Error ? e.message : "操作未完成，请重试。";
  message.value = "";
}
function safeToLeaveForm() {
  return (
    !formDirty.value ||
    window.confirm("当前表单尚未保存到草稿，确定放弃这些修改吗？")
  );
}
function choose(paper: Publication | null) {
  selectedId.value = paper?.id || null;
  form.value = paper ? structuredClone(toRaw(paper)) : null;
  authorsText.value = paper?.authors.join("\n") || "";
  originalForm.value = JSON.stringify({
    form: form.value,
    authors: authorsText.value,
  });
  previewOpen.value = false;
}
function select(paper: Publication) {
  if (safeToLeaveForm()) choose(paper);
}
function addPaper() {
  if (!safeToLeaveForm()) return;
  choose({
    id: `paper-${crypto.randomUUID()}`,
    title: "",
    authors: [],
    abstract: "",
    image: { src: "", alt: "" },
    links: [{ kind: "paper", label: "论文", href: "" }],
  });
  announce("填写内容后，先保存到草稿，再统一发布。");
}
function getFormPaper(): Publication | null {
  if (!form.value) return null;
  const value = structuredClone(toRaw(form.value));
  value.title = value.title.trim();
  value.abstract = value.abstract.trim();
  value.authors = authorsText.value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);
  value.links = value.links.map((link) => ({
    ...link,
    label: link.label.trim(),
    href: link.href.trim(),
  }));
  if (value.image) {
    value.image.src = value.image.src.trim();
    value.image.alt = value.image.alt.trim();
  }
  const errors = validatePublicationDocument({
    schemaVersion: 1,
    publications: [value],
  });
  if (errors.length) {
    error.value = errors.join("\n");
    return null;
  }
  return value;
}
function saveForm() {
  const value = getFormPaper();
  if (!value) return false;
  const index = draft.value.publications.findIndex((p) => p.id === value.id);
  if (index < 0) draft.value.publications.unshift(value);
  else draft.value.publications[index] = value;
  choose(value);
  announce("已保存到本页草稿，点击「发布更新」后才会更新网站。");
  return true;
}
function move(index: number, step: number) {
  const target = index + step;
  if (target < 0 || target >= draft.value.publications.length) return;
  const item = draft.value.publications.splice(index, 1)[0]!;
  draft.value.publications.splice(target, 0, item);
  announce("已调整草稿中的展示顺序。");
}
function removePaper() {
  const id = deleteId.value;
  if (!id) return;
  draft.value.publications = draft.value.publications.filter(
    (p) => p.id !== id,
  );
  if (selectedId.value === id) choose(draft.value.publications[0] || null);
  deleteId.value = null;
  announce("已从草稿移除，发布后才会从网站删除。");
}
function addLink() {
  form.value?.links.push({ kind: "paper", label: "论文", href: "" });
}
const linkKinds: { value: PublicationLink["kind"]; label: string }[] = [
  { value: "paper", label: "论文" },
  { value: "code", label: "代码" },
  { value: "project", label: "项目" },
  { value: "dataset", label: "数据集" },
  { value: "other", label: "其他" },
];

async function pickImage(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !form.value) return;
  imageBusy.value = true;
  error.value = "";
  try {
    const formats: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
    };
    const extension = formats[file.type];
    if (!extension || file.size > 3 * 1024 * 1024)
      throw new Error("请选择不超过 3 MB 的 PNG、JPG 或 WebP 图片。");
    const buffer = new Uint8Array(await file.arrayBuffer());
    const matches =
      extension === "png"
        ? [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => buffer[i] === v)
        : extension === "jpg"
          ? buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
          : new TextDecoder().decode(buffer.subarray(0, 4)) === "RIFF" &&
            new TextDecoder().decode(buffer.subarray(8, 12)) === "WEBP";
    if (!matches) throw new Error("文件内容与图片格式不符，请重新导出图片。");
    const bitmap = await createImageBitmap(file);
    const width = bitmap.width,
      height = bitmap.height;
    bitmap.close();
    if (width > 20000 || height > 20000)
      throw new Error("图片尺寸过大，请压缩后上传。");
    const preview = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("无法读取图片。"));
      reader.readAsDataURL(file);
    });
    const src = `images/publications/upload-${crypto.randomUUID()}.${extension}`;
    pendingImages.set(`public/${src}`, {
      path: `public/${src}`,
      content: preview.split(",")[1]!,
      preview,
    });
    form.value.image = {
      src,
      alt: form.value.image?.alt || form.value.title || "论文研究示意图",
      width,
      height,
    };
    announce("图片已加入草稿，将与论文内容一起发布。");
  } catch (e) {
    handleError(e);
  } finally {
    imageBusy.value = false;
    input.value = "";
  }
}

async function connect() {
  if (!tokenInput.value.trim()) {
    error.value = "请填写你自己的 GitHub 访问令牌。";
    return;
  }
  if (
    dirty.value &&
    !window.confirm(
      "连接将读取线上最新论文并替换当前草稿。请先下载草稿备份，确定继续吗？",
    )
  )
    return;
  busy.value = true;
  announce();
  const next = new GithubPublications(tokenInput.value);
  tokenInput.value = "";
  try {
    const result = await next.connect();
    client?.disconnect();
    client = next;
    login.value = result.login;
    snapshot = result.snapshot;
    draft.value = structuredClone(result.snapshot.document);
    baseline.value = JSON.stringify(draft.value);
    pendingImages.clear();
    demo.value = false;
    commitUrl.value = "";
    choose(draft.value.publications[0] || null);
    announce(`已连接 ${result.login}，已读取最新论文。`);
  } catch (e) {
    next.disconnect();
    handleError(e);
  } finally {
    busy.value = false;
  }
}
function startDemo() {
  demo.value = true;
  choose(draft.value.publications[0] || null);
  announce(
    "试用模式：可以编辑和预览，连接 GitHub 后才能发布。试用草稿不会写入网站。",
  );
}
function disconnect() {
  if (dirty.value && !window.confirm("尚有未发布修改，确定退出并放弃草稿吗？"))
    return;
  client?.disconnect();
  tokenInput.value = "";
  client = null;
  snapshot = null;
  login.value = "";
  demo.value = false;
  draft.value = {
    schemaVersion: 1,
    publications: structuredClone(publications),
  };
  baseline.value = JSON.stringify(draft.value);
  pendingImages.clear();
  choose(null);
  commitUrl.value = "";
  announce("已退出，访问凭据已从本页内存清除。");
}
function downloadDraft() {
  const backup = {
    ...toRaw(draft.value),
    unsavedForm: formDirty.value
      ? { ...toRaw(form.value), authors: authorsText.value.split("\n") }
      : undefined,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "csl-publications-draft.json";
  a.click();
  URL.revokeObjectURL(url);
  announce("已下载文字草稿备份。未发布的本地图片请保留原文件。");
}
async function mergeLatest() {
  if (!client || !snapshot) return;
  if (formDirty.value && !saveForm()) return;
  busy.value = true;
  announce();
  try {
    const remote = await client.load();
    const result = mergePublications(
      snapshot.document,
      toRaw(draft.value),
      remote.document,
    );
    if (result.conflicts.length)
      throw new Error(
        `以下内容被多人修改：${result.conflicts.join("、")}。未覆盖当前草稿。请下载草稿备份，与其他作者核对后重新连接并更新。`,
      );
    draft.value = result.document;
    snapshot = remote;
    baseline.value = JSON.stringify(remote.document);
    choose(
      draft.value.publications.find((p) => p.id === selectedId.value) ||
        draft.value.publications[0] ||
        null,
    );
    announce("已合并最新版，保留你对其他论文的修改。请检查后发布。");
  } catch (e) {
    handleError(e);
  } finally {
    busy.value = false;
  }
}
async function publish() {
  if (!client || !snapshot || demo.value) return;
  if (formDirty.value && !saveForm()) return;
  if (!draftDirty.value) {
    announce("没有需要发布的修改。");
    return;
  }
  const errors = validatePublicationDocument(toRaw(draft.value));
  if (errors.length) {
    error.value = errors.join("\n");
    return;
  }
  if (
    !window.confirm(
      `确认发布当前 ${draft.value.publications.length} 篇论文？新增、修改、删除及排序将一并更新到公开网站。`,
    )
  )
    return;
  busy.value = true;
  announce("正在提交更新，请保持页面打开……");
  try {
    const used = new Set(
      draft.value.publications.map((p) => `public/${p.image?.src}`),
    );
    const images = [...pendingImages.values()].filter(
      (image) => used.has(image.path) && !image.published,
    );
    const result = await client.publish(toRaw(draft.value), snapshot, images);
    snapshot = result;
    baseline.value = JSON.stringify(draft.value);
    commitUrl.value = result.commitUrl;
    for (const image of images) image.published = true;
    // Keep local previews until the deployment makes new images available.
    announce(
      "已提交发布。网站正在自动构建，通常约 1–2 分钟后更新；可在发布进度中确认结果。",
    );
  } catch (e) {
    handleError(e);
  } finally {
    busy.value = false;
  }
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value || busy.value) {
    event.preventDefault();
    event.returnValue = "";
  }
}
onMounted(() => {
  ready.value = true;
  window.addEventListener("beforeunload", beforeUnload);
});
onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", beforeUnload);
  client?.disconnect();
});
onBeforeRouteLeave(
  () =>
    (!dirty.value && !busy.value) ||
    window.confirm("还有未发布修改或正在进行的操作，确定离开编辑页吗？"),
);
</script>

<template>
  <article class="interior-page editor-page">
    <PageBanner title="论文编辑" english="Publication Editor" />
    <div class="editor-container">
      <header class="editor-intro">
        <div>
          <p class="eyebrow">CSL / CONTENT STUDIO</p>
          <h2>让研究成果保持更新。</h2>
          <p>编辑图片、标题、作者、Abstract 与链接，统一发布到研究成果页面。</p>
        </div>
        <NuxtLink to="/publications/" class="text-link"
          >查看论文页面 ↗</NuxtLink
        >
      </header>

      <section
        v-if="!login"
        class="connection-panel"
        aria-labelledby="connection-title"
      >
        <div>
          <h3 id="connection-title">连接你的 GitHub 账号</h3>
          <p>
            仅网站仓库协作者可以发布。凭据仅保留在当前页面内存中，刷新或退出后清除。
          </p>
          <details class="credential-help">
            <summary>第一次使用：如何获取编辑权限和凭据</summary>
            <ol>
              <li>
                请管理员将你的 GitHub 用户名添加为
                <strong>{{ repository }}</strong> 的协作者，并接受邀请。
              </li>
              <li>
                普通协作者：创建
                <a
                  href="https://github.com/settings/tokens/new?description=CSL%20Publication%20Editor&scopes=public_repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  >GitHub classic 访问令牌</a
                >，只勾选 <code>public_repo</code>，设置有效期。
              </li>
              <li>
                仓库所有者 stay-cnsj 也可使用
                <a
                  href="https://github.com/settings/personal-access-tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  >fine-grained 令牌</a
                >，仅选择本仓库，授予 Contents 读写权限。
              </li>
              <li>
                把令牌粘贴到下方连接。每位作者使用自己的令牌，不共享；classic
                令牌会覆盖你有权写入的公开仓库，可随时在 GitHub 撤销。
              </li>
            </ol>
          </details>
        </div>
        <form class="connection-form" @submit.prevent="connect">
          <label for="github-token">GitHub 访问令牌</label
          ><input
            id="github-token"
            v-model="tokenInput"
            class="form-control"
            type="password"
            autocomplete="off"
            spellcheck="false"
            placeholder="粘贴你的个人访问令牌"
            :disabled="locked"
          />
          <div class="button-row">
            <button class="btn btn-primary" :disabled="locked" type="submit">
              {{ busy ? "正在连接…" : "连接并读取论文" }}</button
            ><button
              v-if="!demo"
              class="btn btn-outline-secondary"
              :disabled="locked"
              type="button"
              @click="startDemo"
            >
              先试用编辑器
            </button>
          </div>
        </form>
      </section>

      <div v-if="message" class="notice notice-success" role="status">
        {{ message }}
      </div>
      <div v-if="error" class="notice notice-error" role="alert">
        {{ error }}
      </div>
      <p v-if="commitUrl" class="publish-links">
        <a :href="commitUrl" target="_blank" rel="noopener noreferrer"
          >查看本次修改</a
        ><a
          :href="`https://github.com/${repository}/actions`"
          target="_blank"
          rel="noopener noreferrer"
          >查看发布进度 ↗</a
        ><a
          :href="asset('publications/')"
          target="_blank"
          rel="noopener noreferrer"
          >打开线上页面 ↗</a
        >
      </p>

      <template v-if="active">
        <div class="editor-toolbar">
          <div>
            <span class="connection-dot" :class="{ 'is-demo': demo }"></span
            ><strong>{{ demo ? "试用模式" : login }}</strong
            ><span class="draft-status">{{
              dirty ? "有未发布修改" : "草稿与已读取版本一致"
            }}</span>
          </div>
          <div class="button-row">
            <button
              class="btn btn-light"
              :disabled="locked"
              @click="downloadDraft"
            >
              下载草稿</button
            ><button
              v-if="login"
              class="btn btn-light"
              :disabled="locked"
              @click="mergeLatest"
            >
              合并最新版</button
            ><button
              class="btn btn-light"
              :disabled="locked"
              @click="disconnect"
            >
              {{ demo ? "结束试用" : "退出" }}</button
            ><button
              class="btn btn-primary"
              :disabled="locked || demo || !dirty"
              @click="publish"
            >
              {{ busy ? "处理中…" : "发布更新" }}
            </button>
          </div>
        </div>
        <div class="editor-workspace">
          <aside class="paper-sidebar" aria-label="论文草稿列表">
            <div class="sidebar-heading">
              <h3>
                论文 <span>{{ draft.publications.length }}</span>
              </h3>
              <button
                class="btn btn-primary"
                :disabled="locked"
                @click="addPaper"
              >
                ＋ 新增
              </button>
            </div>
            <p class="sidebar-hint">
              所有操作先保存在本页草稿中。离开前请发布或下载备份。
            </p>
            <ol class="paper-list">
              <li
                v-for="(paper, index) in draft.publications"
                :key="paper.id"
                :class="{ selected: selectedId === paper.id }"
              >
                <button
                  class="paper-select"
                  :disabled="locked"
                  @click="select(paper)"
                >
                  <span class="paper-number">{{
                    String(index + 1).padStart(2, "0")
                  }}</span
                  ><span
                    >{{ paper.title
                    }}<small v-if="paper.isPlaceholder">占位示例</small></span
                  >
                </button>
                <div class="paper-actions">
                  <button
                    :disabled="locked || index === 0"
                    :aria-label="`上移 ${paper.title}`"
                    @click="move(index, -1)"
                  >
                    上移 ↑</button
                  ><button
                    :disabled="
                      locked || index === draft.publications.length - 1
                    "
                    :aria-label="`下移 ${paper.title}`"
                    @click="move(index, 1)"
                  >
                    下移 ↓</button
                  ><button
                    class="delete-button"
                    :disabled="locked"
                    :aria-label="`删除 ${paper.title}`"
                    @click="deleteId = paper.id"
                  >
                    删除
                  </button>
                </div>
              </li>
            </ol>
            <p v-if="!draft.publications.length" class="empty-draft">
              还没有论文，点击「新增」开始。
            </p>
          </aside>
          <section class="paper-edit-panel" aria-labelledby="paper-edit-title">
            <form v-if="form" @submit.prevent="saveForm">
              <div class="form-heading">
                <div>
                  <p class="eyebrow">PAPER DETAILS</p>
                  <h3 id="paper-edit-title">
                    {{
                      draft.publications.some((p) => p.id === form!.id)
                        ? "编辑论文"
                        : "新增论文"
                    }}
                  </h3>
                </div>
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  :disabled="locked"
                  @click="previewOpen = !previewOpen"
                >
                  {{ previewOpen ? "收起预览" : "预览" }}
                </button>
              </div>
              <fieldset :disabled="locked">
                <div class="image-editor">
                  <div class="image-preview">
                    <img
                      v-if="imagePreview"
                      :src="imagePreview"
                      alt="当前论文配图预览"
                      referrerpolicy="no-referrer"
                    /><span v-else>添加论文配图</span>
                  </div>
                  <div>
                    <label for="paper-image-file">论文图片</label
                    ><input
                      id="paper-image-file"
                      type="file"
                      class="form-control"
                      accept="image/png,image/jpeg,image/webp"
                      @change="pickImage"
                    />
                    <p class="field-help">
                      PNG、JPG、WebP，最大 3 MB。图片将随论文一起上传。
                    </p>
                    <label for="paper-image-url">或填写图片地址</label
                    ><input
                      id="paper-image-url"
                      :value="form.image?.src || ''"
                      class="form-control"
                      placeholder="https://…"
                      @input="
                        form.image = {
                          src: ($event.target as HTMLInputElement).value,
                          alt: form.image?.alt || '',
                        }
                      "
                    />
                  </div>
                </div>
                <label for="paper-image-alt">图片说明</label
                ><input
                  id="paper-image-alt"
                  :value="form.image?.alt || ''"
                  class="form-control"
                  maxlength="500"
                  placeholder="简要描述图中研究内容，方便所有读者理解"
                  @input="
                    form.image = {
                      ...form.image,
                      src: form.image?.src || '',
                      alt: ($event.target as HTMLInputElement).value,
                    }
                  "
                />
                <label for="paper-title">标题 <span>*</span></label
                ><input
                  id="paper-title"
                  v-model="form.title"
                  class="form-control"
                  maxlength="240"
                  required
                  placeholder="论文完整标题"
                />
                <label for="paper-authors"
                  >作者 <span v-if="!form.isPlaceholder">*</span></label
                ><textarea
                  id="paper-authors"
                  v-model="authorsText"
                  class="form-control"
                  rows="3"
                  placeholder="每行一位，按论文署名顺序填写"
                  :required="!form.isPlaceholder"
                ></textarea>
                <label for="paper-abstract">Abstract <span>*</span></label
                ><textarea
                  id="paper-abstract"
                  v-model="form.abstract"
                  class="form-control abstract-input"
                  rows="8"
                  maxlength="20000"
                  required
                  placeholder="粘贴论文摘要，支持中文或英文"
                ></textarea>
                <div class="links-heading">
                  <label
                    >相关链接 <span v-if="!form.isPlaceholder">*</span></label
                  ><button
                    class="btn btn-sm btn-light"
                    type="button"
                    :disabled="form.links.length >= 10"
                    @click="addLink"
                  >
                    ＋ 添加链接
                  </button>
                </div>
                <div
                  v-for="(link, index) in form.links"
                  :key="index"
                  class="link-fields"
                >
                  <select
                    v-model="link.kind"
                    class="form-select"
                    :aria-label="`链接 ${index + 1} 类型`"
                  >
                    <option
                      v-for="kind in linkKinds"
                      :key="kind.value"
                      :value="kind.value"
                    >
                      {{ kind.label }}
                    </option></select
                  ><input
                    v-model="link.label"
                    class="form-control"
                    :aria-label="`链接 ${index + 1} 名称`"
                    maxlength="60"
                    placeholder="显示名称"
                    required
                  /><input
                    v-model="link.href"
                    class="form-control"
                    :aria-label="`链接 ${index + 1} 地址`"
                    placeholder="https://…"
                    type="url"
                    required
                  /><button
                    type="button"
                    class="remove-link"
                    :aria-label="`移除链接 ${index + 1}`"
                    @click="form.links.splice(index, 1)"
                  >
                    ×
                  </button>
                </div>
                <p v-if="!form.links.length" class="field-help">
                  尚未添加链接。
                </p>
                <label class="placeholder-check"
                  ><input
                    v-model="form.isPlaceholder"
                    type="checkbox"
                    class="form-check-input"
                  />这是占位示例（公开页面会明确标注）</label
                >
                <div class="form-save">
                  <p>保存草稿后，可继续编辑其他论文，最后统一发布。</p>
                  <button class="btn btn-primary" type="submit">
                    保存到草稿
                  </button>
                </div>
              </fieldset>
            </form>
            <div v-else class="choose-empty">
              <p class="eyebrow">YOUR NEXT PUBLICATION</p>
              <h3 id="paper-edit-title">选择或新增一篇论文</h3>
              <p>每项研究都有值得分享的故事。</p>
              <button
                class="btn btn-primary"
                :disabled="locked"
                @click="addPaper"
              >
                新增论文
              </button>
            </div>
            <section
              v-if="previewOpen && form"
              class="paper-preview"
              aria-label="论文预览"
            >
              <p class="eyebrow">预览</p>
              <img
                v-if="imagePreview"
                :src="imagePreview"
                :alt="form.image?.alt"
                referrerpolicy="no-referrer"
              />
              <p v-if="form.isPlaceholder" class="field-help">占位示例</p>
              <h3>{{ form.title || "论文标题" }}</h3>
              <p class="preview-authors">
                {{
                  authorsText.split("\n").filter(Boolean).join(", ") ||
                  "作者待补充"
                }}
              </p>
              <h4>Abstract</h4>
              <p class="preview-abstract">{{ form.abstract }}</p>
              <span
                v-for="(link, index) in form.links"
                :key="index"
                class="preview-link"
                >{{ link.label || "相关链接" }} ↗</span
              >
            </section>
          </section>
        </div>
      </template>
      <dialog
        ref="deleteDialog"
        aria-labelledby="delete-title"
        class="delete-dialog"
        @cancel.prevent="deleteId = null"
        @click.self="deleteId = null"
      >
        <h3 id="delete-title">从草稿中删除这篇论文？</h3>
        <p>{{ deleteTitle }}</p>
        <p class="field-help">点击「发布更新」后，删除才会同步到网站。</p>
        <div class="button-row">
          <button class="btn btn-light" autofocus @click="deleteId = null">
            取消</button
          ><button class="btn btn-danger" @click="removePaper">确认删除</button>
        </div>
      </dialog>
    </div>
  </article>
</template>

<style scoped>
.editor-container {
  max-width: 1500px;
  padding: 0 4vw 80px;
  margin: auto;
}
.editor-intro {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: center;
  margin-bottom: 36px;
}
.editor-intro h2 {
  font-size: 34px;
  margin-bottom: 14px;
}
.editor-intro p:not(.eyebrow) {
  color: #626262;
  font-size: 16px;
  margin: 0;
}
.editor-intro .text-link {
  white-space: nowrap;
  font-size: 14px;
}
.connection-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 44px;
  padding: 32px;
  background: #f6f5f3;
  border: 1px solid #e7e4df;
  margin-bottom: 28px;
}
.connection-panel h3 {
  font-size: 23px;
}
.connection-panel p,
.credential-help {
  font-size: 14px;
  line-height: 1.8;
  color: #5c5b57;
}
.credential-help summary {
  color: #6d2026;
  text-decoration: underline;
  cursor: pointer;
}
.credential-help ol {
  padding-left: 22px;
  margin: 15px 0 0;
}
.credential-help li {
  margin-bottom: 10px;
}
.connection-form {
  align-self: center;
}
.editor-container label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 8px;
}
.connection-form label {
  margin-top: 0;
}
.form-control,
.form-select {
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  border-color: #d8d6d2;
  padding: 11px 12px;
}
.form-control:focus,
.form-select:focus {
  border-color: #90141c;
  box-shadow: 0 0 0 0.15rem #90141c12;
}
.btn {
  font-size: 14px;
  line-height: 1.5;
  padding: 10px 16px;
  border-radius: 3px;
}
.connection-form .button-row {
  margin-top: 14px;
}
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.notice {
  padding: 15px 20px;
  border-left: 3px solid #648176;
  margin: 20px 0;
  font-size: 15px;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.notice-success {
  background: #f0f5f2;
  color: #304d40;
}
.notice-error {
  background: #fff3f2;
  color: #82242b;
  border-color: #aa3b3e;
}
.publish-links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 14px;
}
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #dedbd6;
  border-bottom: 1px solid #dedbd6;
  margin: 30px 0 28px;
  font-size: 14px;
}
.connection-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #467b62;
  margin-right: 8px;
}
.connection-dot.is-demo {
  background: #b88730;
}
.draft-status {
  margin-left: 16px;
  color: #75736d;
  font-size: 13px;
}
.editor-workspace {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  gap: 38px;
  align-items: start;
}
.paper-sidebar {
  min-width: 0;
}
.sidebar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sidebar-heading h3 {
  font-size: 22px;
  margin: 0;
}
.sidebar-heading h3 span {
  font-size: 13px;
  color: #76736d;
  margin-left: 6px;
}
.sidebar-hint {
  font-size: 12px;
  color: #77746e;
  line-height: 1.8;
}
.paper-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.paper-list li {
  border: 1px solid #e3e0da;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #fff;
  overflow: hidden;
}
.paper-list li.selected {
  border-color: #a75157;
  background: #faf6f5;
  box-shadow: inset 3px 0 #90141c;
}
.paper-select {
  border: 0;
  background: none;
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 18px 16px;
  text-align: left;
  font-size: 15px;
  line-height: 1.55;
  color: #272522;
}
.paper-number {
  font-size: 12px;
  color: #9a948b;
  padding-top: 3px;
}
.paper-select small {
  display: block;
  font-size: 11px;
  color: #915359;
  margin-top: 7px;
}
.paper-actions {
  display: flex;
  gap: 14px;
  padding: 0 16px 14px 44px;
}
.paper-actions button {
  padding: 0;
  border: 0;
  background: none;
  font-size: 12px;
  color: #66625a;
}
.paper-actions .delete-button {
  color: #94434a;
  margin-left: auto;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.paper-edit-panel {
  border: 1px solid #e3e0da;
  border-radius: 6px;
  padding: 32px;
  min-width: 0;
}
.form-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.form-heading .eyebrow {
  font-size: 11px;
  margin-bottom: 7px;
}
.form-heading h3 {
  font-size: 26px;
  margin: 0;
}
fieldset {
  min-width: 0;
}
.image-editor {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}
.image-editor label:first-child {
  margin-top: 0;
}
.image-preview {
  background: #f3f2ef;
  border: 1px dashed #d7d2c9;
  border-radius: 4px;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #989084;
  font-size: 13px;
}
.image-preview img {
  display: block;
  width: 100%;
  max-height: 230px;
  object-fit: contain;
}
.field-help {
  font-size: 12px;
  line-height: 1.7;
  color: #79746c;
  margin: 7px 0 0;
}
.paper-edit-panel label > span {
  color: #90141c;
}
.abstract-input {
  line-height: 1.9;
}
.links-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 22px 0 8px;
}
.links-heading label {
  margin: 0;
}
.link-fields {
  display: grid;
  grid-template-columns: 90px 100px minmax(0, 1fr) 26px;
  gap: 8px;
  margin-bottom: 10px;
}
.link-fields .form-control,
.link-fields .form-select {
  font-size: 13px;
  padding: 9px;
}
.remove-link {
  font-size: 24px;
  border: 0;
  background: none;
  color: #8a4b4e;
}
.editor-container .placeholder-check {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 400;
  color: #746c63;
  font-size: 13px;
  margin: 28px 0;
}
.form-check-input {
  margin: 0;
  flex-shrink: 0;
}
.form-check-input:checked {
  background-color: #90141c;
  border-color: #90141c;
}
.form-save {
  border-top: 1px solid #e8e4de;
  padding-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.form-save p {
  font-size: 12px;
  color: #79746c;
  margin: 0;
}
.form-save button {
  flex-shrink: 0;
}
.choose-empty {
  padding: 70px 15px;
  text-align: center;
}
.choose-empty h3 {
  font-size: 25px;
}
.choose-empty p:not(.eyebrow),
.empty-draft {
  font-size: 14px;
  color: #7a746b;
}
.paper-preview {
  padding-top: 30px;
  margin-top: 35px;
  border-top: 1px solid #d6d0c6;
}
.paper-preview img {
  max-width: 100%;
  max-height: 340px;
  object-fit: contain;
  display: block;
  margin-bottom: 20px;
}
.paper-preview h3 {
  font-size: 27px;
}
.preview-authors {
  color: #727272;
  font-size: 14px;
}
.paper-preview h4 {
  font-size: 15px;
}
.preview-abstract {
  white-space: pre-wrap;
  font-size: 16px;
  overflow-wrap: anywhere;
}
.preview-link {
  display: inline-block;
  font-size: 14px;
  margin: 0 18px 8px 0;
  color: #90141c;
}
.delete-dialog::backdrop {
  background: #0007;
}
.delete-dialog {
  border: 0;
  background: #fff;
  max-width: 520px;
  width: calc(100% - 48px);
  padding: 32px;
  box-shadow: 0 12px 40px #0002;
}
.delete-dialog h3 {
  font-size: 23px;
}
.delete-dialog p {
  font-size: 15px;
}
.delete-dialog .button-row {
  justify-content: flex-end;
  margin-top: 24px;
}
@media (max-width: 1050px) {
  .editor-workspace {
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 22px;
  }
  .image-editor {
    grid-template-columns: 1fr;
  }
  .image-preview {
    max-width: 300px;
  }
  .link-fields {
    grid-template-columns: 90px minmax(0, 1fr) 26px;
  }
  .link-fields input[type="url"] {
    grid-column: 1/3;
    grid-row: 2;
  }
  .remove-link {
    grid-column: 3;
    grid-row: 1/3;
  }
  .editor-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .connection-panel {
    gap: 25px;
  }
}
@media (max-width: 767px) {
  .editor-container {
    padding: 0 6vw 50px;
  }
  .editor-intro {
    display: block;
    margin-bottom: 25px;
  }
  .editor-intro h2 {
    font-size: 27px;
  }
  .connection-panel {
    grid-template-columns: 1fr;
    padding: 22px;
    gap: 20px;
  }
  .editor-workspace {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .paper-list {
    max-height: 380px;
    overflow: auto;
  }
  .paper-edit-panel {
    padding: 22px 18px;
  }
  .image-editor {
    grid-template-columns: 1fr;
  }
  .image-preview {
    max-width: none;
  }
  .form-save {
    flex-direction: column;
    align-items: stretch;
  }
  .draft-status {
    display: block;
    margin: 5px 0 0;
  }
  .editor-toolbar .button-row {
    gap: 7px;
  }
  .editor-toolbar .btn {
    padding: 9px 12px;
  }
  .delete-dialog {
    padding: 25px;
  }
  .publish-links {
    gap: 12px;
  }
}
</style>
