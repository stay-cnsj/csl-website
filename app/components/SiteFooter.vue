<script setup lang="ts">
import { navigation, site } from "~/data/site";
const copyrightYear = useState("copyright-year", () =>
  new Date().getFullYear(),
);
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner container-fluid">
      <div class="row gx-lg-5 gy-4">
        <div class="col-md-7 footer-identity">
          <NuxtLink class="footer-title" to="/">{{ site.name }}</NuxtLink>
          <p class="footer-english" lang="en">{{ site.englishName }}</p>
          <p class="footer-description">
            融合认知科学与数据科学<br />探索大模型与智能体的认知能力
          </p>
          <p class="footer-direction">
            {{ site.directionStatus }}<br />{{ site.directionSummary }}
          </p>
        </div>
        <div class="col-md-5">
          <nav class="footer-links" aria-label="页脚导航">
            <ul>
              <li v-for="item in navigation" :key="item.to">
                <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ copyrightYear }} CSL</span
        ><NuxtLink to="/editor/">论文编辑</NuxtLink><span>{{ site.name }}</span>
      </div>
    </div>
  </footer>
</template>
