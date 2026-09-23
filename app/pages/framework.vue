<script setup lang="ts">
import { site, frameworkStages } from "~/data/site";
const asset = useAssetPath();
const imageDialog = useTemplateRef<HTMLDialogElement>("imageDialog");
useSeoMeta({
  title: `研究架构 · ${site.name}`,
  description:
    "从数据基础与模型训练，到大模型与认知智能、关键系统能力及重点应用场景。",
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
    <PageBanner title="研究架构" english="Research framework" />
    <p class="framework-intro content-width">数据驱动 · 认知启发 · 安全可信</p>
    <div class="framework-figure-wrap">
      <figure class="framework-figure">
        <button
          class="figure-zoom"
          type="button"
          aria-label="放大查看研究方向架构图"
          @click="openImage"
        >
          <img
            :src="asset('images/research-framework.png')"
            alt="认知启发的大模型与数据智能研究方向架构：由数据基础与模型训练，经大模型与认知智能、关键系统能力，走向重点应用场景。完整文字说明见下方。"
            width="1672"
            height="941"
          /><span class="zoom-hint"
            >放大查看 <span aria-hidden="true">⤢</span></span
          >
        </button>
        <figcaption>认知启发的大模型与数据智能研究方向架构</figcaption>
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
        <span>研究方向架构</span
        ><button type="button" autofocus @click="closeImage">
          关闭 <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="dialog-image">
        <img
          :src="asset('images/research-framework.png')"
          alt="认知启发的大模型与数据智能研究方向架构完整图"
          width="1672"
          height="941"
        />
      </div>
      <a
        :href="asset('images/research-framework.png')"
        target="_blank"
        rel="noopener"
        class="original-image-link"
        >在新窗口查看原图</a
      >
    </dialog>
  </article>
</template>
