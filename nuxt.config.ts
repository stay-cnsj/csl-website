const baseURL = process.env.NUXT_APP_BASE_URL || "/";

export default defineNuxtConfig({
  compatibilityDate: "2026-09-23",
  devtools: { enabled: false },
  css: ["bootstrap/dist/css/bootstrap.min.css", "~/assets/css/main.css"],
  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: "zh-CN" },
      title: "认知大模型与数据智能 · CSL",
      meta: [
        {
          name: "description",
          content:
            "融合认知科学与数据科学，探索大模型与智能体的感知、记忆、联想、推理与决策能力。",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: `${baseURL}favicon.svg` },
      ],
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/research/", "/framework/", "/about/", "/editor/"],
    },
  },
  typescript: { strict: true },
});
