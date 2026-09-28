<script setup lang="ts">
import { site, frameworkStages } from "~/data/site";
import { publications } from "~/data/publications";
const asset = useAssetPath();
const imageDialog = useTemplateRef<HTMLDialogElement>("imageDialog");
useSeoMeta({
  title: `研究架构与成果 · ${site.name}`,
  description: "认知大模型与数据智能研究架构、论文与研究成果。",
});
function openImage() {
  imageDialog.value?.showModal();
}
function closeImage() {
  imageDialog.value?.close();
}
</script>

<template>
  <article class="interior-page framework-page">
    <PageBanner title="研究架构与成果" english="Framework & Publications" />
    <section
      id="framework"
      class="framework-overview"
      aria-labelledby="framework-title"
    >
      <header class="framework-overview-heading content-width">
        <h2 id="framework-title">研究架构</h2>
        <p>数据驱动 · 认知启发 · 安全可信</p>
      </header>
      <div class="framework-figure-wrap">
        <figure class="framework-figure">
          <button
            class="figure-zoom"
            type="button"
            aria-label="放大查看研究方向架构图"
            @click="openImage"
          >
            <img
              :src="asset('images/research-framework.svg')"
              alt="CSL 研究总览：多模态数据与领域知识经智能体训练与优化，构建认知大模型与数据智能体；连接领域应用、可解释性与安全可信、具身智能与世界模型、AI4S 与科学发现，通过反馈与新知识回流持续演进。"
              width="2560"
              height="1600"
            /><span class="zoom-hint"
              >放大查看 <span aria-hidden="true">⤢</span></span
            >
          </button>
          <figcaption>认知大模型与数据智能体 · CSL 研究总览</figcaption>
        </figure>
      </div>
      <section
        class="framework-stages content-width row g-5"
        aria-label="研究架构说明"
      >
        <div
          v-for="stage in frameworkStages"
          :key="stage.number"
          class="col-md-6"
        >
          <span class="topic-index">{{ stage.number }}</span>
          <h2>{{ stage.title }}</h2>
          <p>{{ stage.text }}</p>
        </div>
      </section>
    </section>
    <section
      id="publications"
      class="publications-section"
      aria-labelledby="publications-title"
    >
      <header class="publications-heading">
        <p class="eyebrow">论文与研究成果</p>
        <h2 id="publications-title" lang="en">Publication</h2>
      </header>
      <PublicationList :publications="publications" />
    </section>
    <dialog
      ref="imageDialog"
      class="image-dialog"
      aria-label="研究架构图大图"
      @click="
        (event) => {
          if (event.target === imageDialog) closeImage();
        }
      "
    >
      <div class="dialog-toolbar">
        <span>CSL 研究总览</span
        ><button type="button" autofocus @click="closeImage">
          关闭 <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="dialog-image">
        <img
          :src="asset('images/research-framework.svg')"
          alt="认知大模型与数据智能体：CSL 研究总览完整图"
          width="2560"
          height="1600"
        />
      </div>
      <a
        :href="asset('images/research-framework.svg')"
        target="_blank"
        rel="noopener"
        class="original-image-link"
        >在新窗口查看原图</a
      >
    </dialog>
  </article>
</template>

<style scoped>
.publications-section {
  max-width: 1500px;
  padding: 54px 4vw 0;
  margin: 0 auto 76px;
  border-top: 1px solid #e4e4e4;
}
.publications-heading {
  margin-bottom: 48px;
}
.publications-heading .eyebrow {
  margin-bottom: 8px;
}
.publications-heading h2 {
  font-size: clamp(42px, 5.2vw, 72px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.2;
  margin: 0;
}
.framework-overview-heading {
  margin-bottom: 35px;
}
.framework-overview-heading h2 {
  font-size: 34px;
  margin-bottom: 12px;
}
.framework-overview-heading p {
  font-size: 20px;
  color: #626262;
  margin: 0;
}
@media (max-width: 767px) {
  .publications-section {
    padding: 36px 6vw 0;
    margin-bottom: 44px;
  }
  .publications-heading {
    margin-bottom: 28px;
  }
  .framework-overview-heading h2 {
    font-size: 28px;
  }
  .framework-overview-heading p {
    font-size: 17px;
  }
}
</style>
